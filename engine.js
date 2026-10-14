(function (root) {
  'use strict';
  const REGISTRY = ['hello-world:latest', 'alpine:3.20', 'alpine:latest', 'nginx:alpine', 'redis:7-alpine', 'busybox:1.36'];
  const DOCKERFILE = 'FROM alpine:3.20\nWORKDIR /app\nCOPY message.txt .\nCMD ["cat", "/app/message.txt"]';
  const COMPOSE = 'services:\n  web:\n    image: nginx:alpine\n    ports:\n      - "8080:80"\n  cache:\n    image: redis:7-alpine\n';
  const normalizeImage = image => image.includes(':') ? image : image + ':latest';
  function tokenize(input) {
    const tokens = [];
    let word = '', quote = null, active = false;
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      if (quote) {
        if (char === quote) quote = null;
        else if (char === '\\' && quote === '"' && input[i + 1] === '"') word += input[++i];
        else word += char;
      } else if (char === '"' || char === "'") { quote = char; active = true; }
      else if (/\s/.test(char)) { if (active) { tokens.push(word); word = ''; active = false; } }
      else { word += char; active = true; }
    }
    if (quote) throw new Error('Unclosed quote. Close your quoted argument before running the command.');
    if (active) tokens.push(word);
    return tokens;
  }
  function table(headers, rows) {
    if (!rows.length) return headers.join('   ');
    const widths = headers.map((h, i) => Math.max(h.length, ...rows.map(row => String(row[i] ?? '').length)) + 3);
    return [headers, ...rows].map(row => row.map((v, i) => String(v).padEnd(widths[i])).join('').trimEnd()).join('\n');
  }
  class Engine {
    constructor(mission = null, snapshot = null) {
      this.mission = mission;
      this.state = { seq: 0, images: [], containers: [], volumes: {}, networks: { bridge: [], host: [], none: [] }, marks: {}, files: {} };
      this.seed(mission?.seed);
      if (snapshot && this.validSnapshot(snapshot)) this.state = JSON.parse(JSON.stringify(snapshot));
    }
    validSnapshot(s) {
      const record = value => value && typeof value === 'object' && !Array.isArray(value);
      const textRecord = value => record(value) && Object.values(value).every(v => typeof v === 'string');
      return s && Number.isInteger(s.seq) && s.seq >= 0 && Array.isArray(s.images) && s.images.length <= 1000 && s.images.every(i => typeof i === 'string') &&
        Array.isArray(s.containers) && s.containers.length <= 1000 && s.containers.every(c => c && typeof c.id === 'string' && typeof c.name === 'string' && typeof c.image === 'string' && typeof c.network === 'string' && typeof c.command === 'string' && ['running', 'exited'].includes(c.status) && textRecord(c.ports) && textRecord(c.env) && Array.isArray(c.mounts) && c.mounts.every(m => m && typeof m.name === 'string' && typeof m.target === 'string') && textRecord(c.files) && Array.isArray(c.logs) && c.logs.every(l => typeof l === 'string')) &&
        record(s.volumes) && Object.values(s.volumes).every(textRecord) && record(s.networks) && ['bridge', 'host', 'none'].every(n => Array.isArray(s.networks[n])) && Object.values(s.networks).every(ids => Array.isArray(ids) && ids.every(id => typeof id === 'string')) && record(s.marks) && textRecord(s.files);
    }
    snapshot() { return JSON.parse(JSON.stringify(this.state)); }
    mark(key, value = true) { this.state.marks[key] = value; }
    addImage(image) { image = normalizeImage(image); if (!this.state.images.includes(image)) this.state.images.push(image); return image; }
    addContainer(name, image, status = 'running', extras = {}) {
      this.addImage(image);
      const id = (++this.state.seq).toString(16).padStart(12, 'a');
      const c = { id, name, image: normalizeImage(image), status, detached: true, ports: {}, env: {}, mounts: [], network: 'bridge', files: { '/etc/os-release': 'NAME="Alpine Linux"\nID=alpine\nVERSION_ID=3.20.0' }, logs: [], command: '', ...extras };
      this.state.containers.push(c);
      if (this.state.networks[c.network]) this.state.networks[c.network].push(c.id);
      return c;
    }
    seed(seed) {
      const s = this.state;
      if (seed === 'stopped') this.addContainer('cargo', 'alpine:3.20', 'exited', { command: 'echo delivery complete' });
      if (seed === 'lighthouse') this.addContainer('lighthouse', 'nginx:alpine');
      if (seed === 'beacon') this.addContainer('beacon', 'nginx:alpine', 'running', { env: { QUEST_MODE: 'development' }, logs: ['[info] beacon listening on :80', '[warn] QUEST_MODE=development; production configuration not enabled', '[info] ready for inspection'] });
      if (seed === 'vault') this.addContainer('vault', 'alpine:3.20', 'running', { command: 'sleep 3600', files: { '/secret/flag.txt': 'DOCK{inside_the_box}', '/etc/os-release': 'NAME="Alpine Linux"\nID=alpine' } });
      if (seed === 'cleanup') { this.addContainer('cargo', 'alpine:3.20', 'exited'); this.addContainer('temp', 'alpine:3.20', 'running', { command: 'sleep 3600' }); }
      if (seed === 'volume') {
        s.volumes['cargo-data'] = { '/flag.txt': 'DOCK{data_outlives_containers}' };
        this.addContainer('writer', 'alpine:3.20', 'exited', { mounts: [{ name: 'cargo-data', target: '/data', readonly: false }], command: 'write flag to /data' });
      }
      if (seed === 'build' || seed === 'boss') { s.files.Dockerfile = DOCKERFILE; s.files['message.txt'] = 'Hello from your own image. Ready to ship!'; }
      if (seed === 'compose') s.files['compose.yaml'] = COMPOSE;
      if (seed === 'network') { s.networks.fleet = []; this.addContainer('api', 'nginx:alpine', 'running', { network: 'fleet' }); }
      if (!this.mission) { s.files.Dockerfile = DOCKERFILE; s.files['message.txt'] = 'Hello from your own image. Ready to ship!'; s.files['compose.yaml'] = COMPOSE; }
    }
    container(ref) {
      const exact = this.state.containers.find(c => c.name === ref || c.id === ref);
      if (exact) return exact;
      const matches = this.state.containers.filter(c => ref && c.id.startsWith(ref));
      if (matches.length === 1) return matches[0];
      throw new Error(matches.length > 1 ? `Container prefix ${ref} is ambiguous. Use its name or full ID.` : `No such container: ${ref || '(missing name)'}. Try docker ps -a.`);
    }
    removeContainer(c) {
      this.state.containers = this.state.containers.filter(x => x.id !== c.id);
      Object.values(this.state.networks).forEach(ids => { const i = ids.indexOf(c.id); if (i >= 0) ids.splice(i, 1); });
    }
    execute(input) {
      try {
        const args = tokenize(input.trim());
        if (!args.length) return { output: '', topic: null };
        if (args.some(a => ['&&', '||', '|', ';'].includes(a))) throw new Error('Run one command at a time. Shell chaining and pipes are not supported in this practice terminal.');
        let output, topic = this.mission?.topic || 'run';
        if (args[0] === 'clear') return { output: '', clear: true };
        if (args[0] === 'help') return { output: 'DOCKER QUEST · practice terminal\n\nDocker: version, info, pull, images, run, ps, stop, start, restart, rm, rmi, logs, inspect, exec, build\nStorage: docker volume create | ls | inspect | rm\nNetworks: docker network create | ls | inspect | connect | disconnect | rm\nCompose: docker compose config | up -d | ps | logs | down\nHost: ls, cat <file>, curl <url>, pwd, echo, clear\nQuest: claim (reveal a flag after completing the objectives)\n\nUse ↑ / ↓ for command history, Tab for suggestions, and Ctrl+L to clear.\nThis is a simulator. It does not execute system commands or make network requests.' };
        if (args[0] === 'claim') {
          if (!this.mission) throw new Error('There are no flags in the sandbox. Open a campaign mission to capture one.');
          if (!this.objectives().every(Boolean)) throw new Error('The flag is still locked. Complete the remaining mission objectives, then run claim.');
          this.mark('claimed'); return { output: `Mission objectives verified.\n\n${this.mission.flag}\n\nPaste this flag into the capture field to finish the mission.`, flag: this.mission.flag, topic };
        }
        if (args[0] !== 'docker') {
          output = this.host(args);
          if (args[0] === 'curl') topic = 'ports';
          return { output, topic };
        }
        args.shift();
        const command = args.shift();
        switch (command) {
          case '--version': case 'version': this.mark('version'); output = 'Client: Docker Engine — practice edition\n Version: 27.0.0 (simulated)\n\nServer: Docker Quest offline engine\n Engine: ready\n API: simulated teaching subset'; break;
          case 'info': output = `Docker Quest offline engine\nContainers: ${this.state.containers.length}\n Running: ${this.state.containers.filter(c => c.status === 'running').length}\nImages: ${this.state.images.length}\nStorage Driver: simulated overlay\nNetworking: simulated bridge\nNo real Docker daemon is connected.`; break;
          case 'pull': {
            if (args.length !== 1) throw new Error('Usage: docker pull IMAGE[:TAG]');
            const image = normalizeImage(args[0]);
            if (!REGISTRY.includes(image)) throw new Error(`Image ${image} is not in the offline practice registry. Available: ${REGISTRY.join(', ')}`);
            const cached = this.state.images.includes(image); this.addImage(image); this.mark('pulled:' + image);
            output = cached ? `Status: Image is up to date for ${image}` : `Pulling from the offline practice registry...\n✓ Base filesystem layer\n✓ Image configuration\nStatus: Downloaded newer image for ${image}`; topic = 'image'; break;
          }
          case 'images': output = this.images(args); topic = 'image'; break;
          case 'image': if (args.shift() === 'ls') { output = this.images(args); topic = 'image'; } else throw new Error('Supported: docker image ls. Use docker pull, build, or rmi for other image operations.'); break;
          case 'run': output = this.run(args); break;
          case 'ps': output = this.ps(args); topic = 'lifecycle'; break;
          case 'container': if (args.shift() === 'ls') { output = this.ps(args); topic = 'lifecycle'; } else throw new Error('Supported: docker container ls. Use docker run, stop, start, or rm.'); break;
          case 'stop': case 'start': case 'restart': {
            if (!args.length || args.some(a => a.startsWith('-'))) throw new Error(`Usage: docker ${command} CONTAINER [CONTAINER...]`);
            const containers = args.map(ref => this.container(ref));
            output = containers.map(c => {
              const wasRunning = c.status === 'running';
              c.status = command === 'stop' ? 'exited' : this.isService(c) ? 'running' : 'exited';
              this.mark(command + ':' + c.name);
              if (command === 'stop') this.mark('stoppedId:' + c.name, c.id);
              if (command !== 'stop' && this.state.marks['stoppedId:' + c.name] === c.id) this.mark('restarted:' + c.name);
              if (command === 'restart' && wasRunning) this.mark('restarted:' + c.name);
              return c.name;
            }).join('\n'); topic = 'lifecycle'; break;
          }
          case 'rm': {
            const force = args.includes('-f') || args.includes('--force');
            const refs = args.filter(a => a !== '-f' && a !== '--force');
            if (!refs.length || refs.some(a => a.startsWith('-'))) throw new Error('Usage: docker rm [-f] CONTAINER [CONTAINER...]');
            const containers = refs.map(ref => this.container(ref));
            if (containers.some(c => c.status === 'running' && !force)) throw new Error('Cannot remove a running container. Stop it first with docker stop NAME.');
            output = containers.map(c => { this.removeContainer(c); this.mark('removed:' + c.name); return c.name; }).join('\n'); topic = 'lifecycle'; break;
          }
          case 'rmi': {
            if (args.length !== 1) throw new Error('Usage: docker rmi IMAGE');
            const image = normalizeImage(args[0]);
            if (!this.state.images.includes(image)) throw new Error('No such image: ' + image);
            if (this.state.containers.some(c => c.image === image)) throw new Error('That image is used by a container. Remove the container first.');
            this.state.images = this.state.images.filter(i => i !== image); output = `Untagged: ${image}\nDeleted: simulated image layers`; topic = 'image'; break;
          }
          case 'logs': {
            const refs = args.filter(a => a !== '-f' && a !== '--follow');
            if (refs.length !== 1) throw new Error('Usage: docker logs [-f] CONTAINER');
            const c = this.container(refs[0]); this.mark('logs:' + c.name); output = c.logs.join('\n') || '(No output has been written to stdout or stderr.)';
            if (refs.length !== args.length) output += '\n[Practice mode shows current logs; live following is not simulated.]'; topic = 'logs'; break;
          }
          case 'inspect': {
            if (args.length !== 1) throw new Error('Usage: docker inspect CONTAINER');
            const c = this.container(args[0]); this.mark('inspect:' + c.name);
            output = JSON.stringify([{ Id: c.id, Name: '/' + c.name, Config: { Image: c.image, Env: Object.entries(c.env).map(([k, v]) => `${k}=${v}`) }, State: { Status: c.status, Running: c.status === 'running', ExitCode: 0 }, Mounts: c.mounts.map(m => ({ Type: 'volume', Name: m.name, Destination: m.target, RW: !m.readonly })), NetworkSettings: { Networks: { [c.network]: { IPAddress: '172.18.0.' + (this.state.containers.indexOf(c) + 2) } }, Ports: c.ports } }], null, 2); break;
          }
          case 'exec': {
            while (['-i', '-t', '-it', '-ti'].includes(args[0])) args.shift();
            if (args.length < 2) throw new Error('Usage: docker exec CONTAINER COMMAND [ARG...]');
            const c = this.container(args.shift()); if (c.status !== 'running') throw new Error(`Container ${c.name} is not running. Start it before using exec.`);
            output = this.inside(c, args); topic = ['curl', 'wget'].includes(args[0]) ? 'network' : 'exec'; break;
          }
          case 'build': {
            let tag = null, context = null;
            for (let i = 0; i < args.length; i++) {
              if (args[i] === '-t' || args[i] === '--tag') tag = args[++i];
              else if (args[i].startsWith('--tag=')) tag = args[i].slice(6);
              else if (args[i].startsWith('-')) throw new Error('Practice build supports -t/--tag and the current-directory context.');
              else { if (context) throw new Error('Build accepts one context. Use docker build -t NAME:TAG .'); context = args[i]; }
            }
            if (!tag || context !== '.') throw new Error('Usage: docker build -t NAME:TAG . — the final dot is required as the build context.');
            if (!/^[a-z0-9][a-z0-9._/:\-]*$/.test(tag)) throw new Error('Use a lowercase image name and a valid tag.');
            if (!this.state.files.Dockerfile) throw new Error('No Dockerfile in this mission directory. Builds are available in the workshop and sandbox.');
            this.addImage('alpine:3.20'); this.addImage(tag); this.mark('built:' + normalizeImage(tag));
            output = `[1/4] FROM alpine:3.20\n[2/4] WORKDIR /app\n[3/4] COPY message.txt .\n[4/4] CMD ["cat", "/app/message.txt"]\n✓ Successfully built ${normalizeImage(tag)}\n(Build steps are simulated; the bundled Dockerfile is fixed.)`; topic = 'build'; break;
          }
          case 'volume': output = this.volume(args); topic = 'volume'; break;
          case 'network': output = this.network(args); topic = 'network'; break;
          case 'compose': output = this.compose(args); topic = 'compose'; break;
          default: throw new Error(`Unsupported Docker command: ${command || '(missing command)'}. Type help to see the practice commands.`);
        }
        return { output, topic };
      } catch (error) { return { output: error.message, error: true }; }
    }
    images(args) {
      if (args.some(a => !['-q', '--quiet'].includes(a))) throw new Error('Usage: docker images [-q]');
      this.mark('imagesListed');
      if (args.length) return this.state.images.map((_, i) => 'd0c' + String(i + 1).padStart(9, '0')).join('\n');
      return table(['REPOSITORY', 'TAG', 'IMAGE ID', 'SIZE'], this.state.images.map((image, i) => { const colon = image.lastIndexOf(':'); return [image.slice(0, colon), image.slice(colon + 1), 'd0c' + String(i + 1).padStart(9, '0'), image.startsWith('nginx') ? '43MB' : '8MB']; }));
    }
    ps(args) {
      const allowed = ['-a', '--all', '-q', '--quiet', '-aq', '-qa'];
      if (args.some(a => !allowed.includes(a))) throw new Error('Usage: docker ps [-a] [-q]');
      const all = args.some(a => ['-a', '--all', '-aq', '-qa'].includes(a));
      const quiet = args.some(a => ['-q', '--quiet', '-aq', '-qa'].includes(a));
      this.mark(all ? 'allListed' : 'psListed');
      const list = this.state.containers.filter(c => all || c.status === 'running');
      return quiet ? list.map(c => c.id).join('\n') : table(['CONTAINER ID', 'IMAGE', 'STATUS', 'PORTS', 'NAMES'], list.map(c => [c.id, c.image, c.status === 'running' ? 'Up (simulated)' : 'Exited (0)', Object.entries(c.ports).map(([host, port]) => `${host}->${port}/tcp`).join(', ') || '—', c.name]));
    }
    run(args) {
      const opts = { detached: false, remove: false, name: null, ports: {}, env: {}, mounts: [], network: 'bridge' };
      let image = null, command = [];
      const valueOptions = new Set(['--name', '-p', '--publish', '-v', '--volume', '-e', '--env', '--network', '--mount']);
      for (let i = 0; i < args.length; i++) {
        let option = args[i], value;
        if (!option.startsWith('-')) { image = normalizeImage(option); command = args.slice(i + 1); break; }
        if (['-d', '--detach', '-i', '-t', '-it', '-ti', '-dit', '-dti', '-id', '-di'].includes(option)) { if (option === '--detach' || option.includes('d')) opts.detached = true; continue; }
        if (option === '--rm') { opts.remove = true; continue; }
        if (option.includes('=') && option.startsWith('--')) { const eq = option.indexOf('='); value = option.slice(eq + 1); option = option.slice(0, eq); }
        else if (valueOptions.has(option)) value = args[++i];
        if (!valueOptions.has(option)) throw new Error(`Option ${option} is not supported in practice. Use --name, -d, -p, -v, -e, --network, or --rm.`);
        if (!value || value.startsWith('--')) throw new Error(`Missing value for ${option}.`);
        switch (option) {
          case '--name': opts.name = value; break;
          case '--network': opts.network = value; break;
          case '-p': case '--publish': {
            const bits = value.split(':');
            if (bits.length < 2 || bits.length > 3 || (bits.length === 3 && !['127.0.0.1', '0.0.0.0'].includes(bits[0]))) throw new Error('Port syntax: -p [127.0.0.1:]HOST_PORT:CONTAINER_PORT');
            const host = bits[bits.length - 2], target = bits[bits.length - 1].replace(/\/tcp$/, '');
            if (![host, target].every(x => /^\d+$/.test(x) && Number(x) > 0 && Number(x) <= 65535)) throw new Error('Ports must be numbers from 1 to 65535.');
            opts.ports[String(Number(host))] = String(Number(target)); break;
          }
          case '-e': case '--env': {
            const eq = value.indexOf('='); if (eq < 1) throw new Error('Environment syntax: -e KEY=value');
            const key = value.slice(0, eq); if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) throw new Error('Use a valid environment variable name.');
            opts.env[key] = value.slice(eq + 1); break;
          }
          case '-v': case '--volume': {
            const [name, target, mode] = value.split(':');
            if (!name || !target?.startsWith('/') || (mode && mode !== 'ro' && mode !== 'rw')) throw new Error('Volume syntax: -v VOLUME:/absolute/container/path[:ro]');
            if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name)) throw new Error('Practice mode supports named volumes. Bind mounts to your computer are not supported.');
            opts.mounts.push({ name, target: target.replace(/\/$/, '') || '/', readonly: mode === 'ro' }); break;
          }
          case '--mount': {
            const m = Object.fromEntries(value.split(',').map(pair => { const eq = pair.indexOf('='); return eq < 0 ? [pair, true] : [pair.slice(0, eq), pair.slice(eq + 1)]; }));
            const name = m.source || m.src, target = m.target || m.dst || m.destination;
            if (m.type !== 'volume' || !name || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name) || !target?.startsWith('/')) throw new Error('Supported mount syntax: --mount type=volume,source=NAME,target=/path');
            opts.mounts.push({ name, target: target.replace(/\/$/, '') || '/', readonly: !!m.readonly }); break;
          }
        }
      }
      if (!image) throw new Error('Usage: docker run [OPTIONS] IMAGE [COMMAND] [ARG...]');
      if (opts.name && !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(opts.name)) throw new Error('Container names use letters, numbers, dots, underscores, and hyphens.');
      if (opts.name && this.state.containers.some(c => c.name === opts.name)) throw new Error(`The container name ${opts.name} is already in use. Remove it or choose another name.`);
      if (!Object.hasOwn(this.state.networks, opts.network)) throw new Error(`Network ${opts.network} not found. Create it first with docker network create ${opts.network}.`);
      for (const port of Object.keys(opts.ports)) if (this.state.containers.some(c => c.status === 'running' && c.ports[port])) throw new Error(`Host port ${port} is already in use by a running container.`);
      if (!this.state.images.includes(image) && !REGISTRY.includes(image)) throw new Error(`Image ${image} is not available. Build it locally or choose an image from the practice registry.`);
      const pulled = !this.state.images.includes(image); this.addImage(image);
      opts.mounts.forEach(m => { if (!Object.hasOwn(this.state.volumes, m.name)) this.state.volumes[m.name] = {}; });
      const name = opts.name || 'quest_' + (this.state.seq + 1);
      const c = this.addContainer(name, image, 'exited', { detached: opts.detached, ports: opts.ports, env: opts.env, mounts: opts.mounts, network: opts.network, command: command.join(' ') });
      if (this.state.marks['built:' + image]) c.files['/app/message.txt'] = this.state.files['message.txt'];
      if (!command.length && this.state.marks['built:' + image]) command = ['cat', '/app/message.txt'];
      c.status = this.isService(c) ? 'running' : 'exited';
      let output = '';
      if (image === 'hello-world:latest') { output = 'Hello from Docker!\nThis message shows that your practice container ran successfully.\n\n1. The client contacted the engine.\n2. The engine found the hello-world image.\n3. It created a container and ran its process.\n4. The output arrived in your terminal, and the process exited.'; this.mark('hello'); }
      else if (command.length && !this.isService(c)) output = this.inside(c, command);
      else if (image.startsWith('nginx')) c.logs.push('[info] nginx started; listening on container port 80');
      else if (image.startsWith('redis')) c.logs.push('Ready to accept connections on port 6379');
      if (output) c.logs.push(output);
      this.mark('run:' + name); this.mark('ran:' + image);
      if (opts.detached) output = c.id;
      if (opts.remove && c.status === 'exited') this.removeContainer(c);
      return (pulled ? `Image ${image} fetched from the offline practice registry.\n` : '') + output;
    }
    isService(c) { return /^(sleep\s+(\d+|infinity)|tail\s+-f)/.test(c.command) || (!c.command && /^(nginx|redis):/.test(c.image)); }
    host(args) {
      const [cmd, ...rest] = args;
      if (cmd === 'pwd') return '/home/cadet/mission';
      if (cmd === 'echo') return rest.join(' ');
      if (cmd === 'ls') return Object.keys(this.state.files).join('  ') || '(The mission working directory is empty.)';
      if (cmd === 'cat') {
        if (rest.length !== 1) throw new Error('Usage: cat FILE');
        const name = rest[0].replace(/^\.\//, '');
        if (!Object.hasOwn(this.state.files, name)) throw new Error(`cat: ${name}: No such file in the mission directory. Try ls.`);
        if (name === 'Dockerfile') this.mark('dockerfileRead');
        if (name === 'compose.yaml') this.mark('composeFileRead');
        return this.state.files[name];
      }
      if (cmd === 'curl') { const url = rest.find(a => !a.startsWith('-')); if (!url) throw new Error('Usage: curl http://localhost:PORT'); return this.request(url, null); }
      throw new Error(`Command not found: ${cmd}. Type help for the supported practice commands.`);
    }
    readFile(c, path) {
      path = path.startsWith('/') ? path : '/' + path;
      const mount = c.mounts.find(m => path === m.target || path.startsWith(m.target === '/' ? '/' : m.target + '/'));
      if (mount) { const key = mount.target === '/' ? path : path.slice(mount.target.length); return this.state.volumes[mount.name]?.[key]; }
      return c.files[path];
    }
    inside(c, args) {
      const [cmd, ...rest] = args;
      if (cmd === 'ls') {
        this.mark('ls:' + c.name);
        const dir = (rest.find(a => !a.startsWith('-')) || '/').replace(/\/$/, '') || '/';
        const paths = [...Object.keys(c.files), ...c.mounts.map(m => m.target + '/'), '/bin/', '/dev/', '/tmp/', '/usr/'];
        c.mounts.forEach(m => Object.keys(this.state.volumes[m.name] || {}).forEach(k => paths.push((m.target === '/' ? '' : m.target) + k)));
        const prefix = dir === '/' ? '/' : dir + '/';
        const children = [...new Set(paths.filter(p => p.startsWith(prefix)).map(p => p.slice(prefix.length).split('/')[0]).filter(Boolean))];
        if (!children.length && !paths.includes(dir) && dir !== '/') throw new Error(`ls: ${dir}: No such directory (or no modeled files here).`);
        return children.join('  ');
      }
      if (cmd === 'cat') {
        if (!rest.length) throw new Error('Usage: docker exec NAME cat /path/to/file');
        return rest.map(path => {
          const value = this.readFile(c, path); if (value === undefined) throw new Error(`cat: ${path}: No such file in ${c.name}.`);
          this.mark('read:' + c.name + ':' + path);
          if (c.name === 'reader' && path === '/data/flag.txt' && c.mounts.some(m => m.name === 'cargo-data' && m.target === '/data')) this.mark('volumeRead');
          return value;
        }).join('\n');
      }
      if (cmd === 'printenv' || cmd === 'env') {
        if (rest[0]) { if (!Object.hasOwn(c.env, rest[0])) throw new Error(`Environment variable ${rest[0]} is not set in ${c.name}.`); this.mark('envRead:' + c.name + ':' + rest[0]); return c.env[rest[0]]; }
        return Object.entries(c.env).map(([k, v]) => `${k}=${v}`).join('\n');
      }
      if (cmd === 'pwd') return c.files['/app/message.txt'] ? '/app' : '/';
      if (cmd === 'hostname') return c.id;
      if (cmd === 'echo') return rest.join(' ');
      if (cmd === 'sleep' || cmd === 'tail') return '';
      if (cmd === 'wget' || cmd === 'curl') {
        const url = rest.find(a => !a.startsWith('-')); if (!url) throw new Error('Specify a URL such as http://api:80.');
        return this.request(url, c);
      }
      if ((cmd === 'sh' || cmd === 'bash') && rest[0] === '-c') {
        const script = tokenize(rest[1] || '');
        const redirect = script.indexOf('>');
        if (redirect !== -1 && script[0] === 'echo' && redirect === script.length - 2) {
          const path = script[redirect + 1];
          if (!path.startsWith('/')) throw new Error('Use an absolute file path in the practice shell.');
          const text = script.slice(1, redirect).join(' ');
          const mount = c.mounts.find(m => path.startsWith(m.target === '/' ? '/' : m.target + '/'));
          if (mount?.readonly) throw new Error('That volume is mounted read-only.');
          if (mount) this.state.volumes[mount.name][mount.target === '/' ? path : path.slice(mount.target.length)] = text;
          else c.files[path] = text;
          return '';
        }
        return this.inside(c, script);
      }
      if (cmd === 'sh' || cmd === 'bash') throw new Error('Interactive shells are not modeled. Run a command directly: docker exec NAME ls / or docker exec NAME cat /path.');
      throw new Error(`The practice container does not model ${cmd}. Supported: ls, cat, printenv, env, echo, hostname, pwd, wget, curl, sleep, and simple sh -c commands.`);
    }
    request(raw, from) {
      let url; try { url = new URL(raw.startsWith('http') ? raw : 'http://' + raw); } catch { throw new Error('Use a valid HTTP URL.'); }
      if (url.protocol !== 'http:') throw new Error('The practice services use HTTP. Use http://HOST:PORT.');
      const port = url.port || '80'; let target;
      if (from) {
        if (['localhost', '127.0.0.1'].includes(url.hostname)) target = from;
        else if (from.network !== 'bridge' && from.network !== 'none' && from.network !== 'host') target = this.state.containers.find(c => c.name === url.hostname && c.network === from.network);
        if (!target) throw new Error(`Cannot resolve ${url.hostname} from ${from.name}. Put both containers on the same user-defined network.`);
        if (target.status !== 'running' || !target.image.startsWith('nginx:') || port !== '80') throw new Error(`Connection refused at ${url.hostname}:${port}. Check the service's internal port and running state.`);
        this.mark('reached:' + from.name + ':' + target.name);
      } else {
        if (!['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error('Host requests in this offline simulator use localhost or 127.0.0.1. Container DNS names work inside a shared network.');
        target = this.state.containers.find(c => c.status === 'running' && c.ports[port] === '80' && c.image.startsWith('nginx:'));
        if (!target) throw new Error(`Connection refused at localhost:${port}. Start an Nginx container and publish ${port}:80.`);
        this.mark('hostReached:' + target.name);
      }
      return `HTTP/1.1 200 OK\nServer: nginx (practice)\n\nWelcome to nginx!\nService: ${target.name}\nRoute: ${from ? from.name + ' → ' + target.name + ':80' : 'localhost:' + port + ' → ' + target.name + ':80'}`;
    }
    volume(args) {
      const [command, name] = args;
      if (command === 'ls' && args.length === 1) return table(['DRIVER', 'VOLUME NAME'], Object.keys(this.state.volumes).map(n => ['local', n]));
      if (!name || args.length !== 2) throw new Error('Usage: docker volume create|inspect|rm NAME, or docker volume ls');
      if (command === 'create') { if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name)) throw new Error('Invalid volume name.'); if (!Object.hasOwn(this.state.volumes, name)) this.state.volumes[name] = {}; return name; }
      if (!Object.hasOwn(this.state.volumes, name)) throw new Error('No such volume: ' + name);
      if (command === 'inspect') return JSON.stringify([{ Name: name, Driver: 'local', Mountpoint: '/var/lib/docker/volumes/' + name + '/_data', Mode: 'simulated' }], null, 2);
      if (command === 'rm') { if (this.state.containers.some(c => c.mounts.some(m => m.name === name))) throw new Error('Volume is in use by a container. Remove that container first.'); delete this.state.volumes[name]; return name; }
      throw new Error('Supported volume commands: create, ls, inspect, rm.');
    }
    network(args) {
      const [command, name, ref] = args;
      if (command === 'ls' && args.length === 1) return table(['NETWORK ID', 'NAME', 'DRIVER'], Object.keys(this.state.networks).map((n, i) => ['net' + i.toString().padStart(9, '0'), n, ['host', 'none'].includes(n) ? n : 'bridge']));
      if (!name) throw new Error('Usage: docker network create|inspect|rm NAME, or docker network connect|disconnect NETWORK CONTAINER');
      if (command === 'create') { if (args.length !== 2 || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name)) throw new Error('Usage: docker network create NAME'); if (Object.hasOwn(this.state.networks, name)) throw new Error('Network already exists: ' + name); this.state.networks[name] = []; this.mark('networkCreated:' + name); return 'net-' + name; }
      if (!Object.hasOwn(this.state.networks, name)) throw new Error('No such network: ' + name);
      if (command === 'inspect' && args.length === 2) { this.mark('networkInspected:' + name); return JSON.stringify([{ Name: name, Driver: 'bridge', Containers: Object.fromEntries(this.state.containers.filter(c => this.state.networks[name].includes(c.id)).map(c => [c.id, { Name: c.name, IPv4Address: '172.18.0.' + (this.state.containers.indexOf(c) + 2) + '/16' }])) }], null, 2); }
      if ((command === 'connect' || command === 'disconnect') && args.length === 3) {
        if (['host', 'none'].includes(name)) throw new Error('Practice connections use bridge networks.');
        const c = this.container(ref);
        if (command === 'connect') { if (c.network === name) throw new Error('Container is already on that network.'); Object.values(this.state.networks).forEach(ids => { const i = ids.indexOf(c.id); if (i >= 0) ids.splice(i, 1); }); c.network = name; this.state.networks[name].push(c.id); }
        else { if (c.network !== name) throw new Error('Container is not on that network.'); this.state.networks[name] = this.state.networks[name].filter(id => id !== c.id); c.network = 'none'; this.state.networks.none.push(c.id); }
        return '(Network membership updated. Practice containers have one active network.)';
      }
      if (command === 'rm' && args.length === 2) { if (['bridge', 'host', 'none'].includes(name)) throw new Error('Built-in networks cannot be removed.'); if (this.state.networks[name].length) throw new Error('Network has active endpoints. Disconnect or remove its containers first.'); delete this.state.networks[name]; return name; }
      throw new Error('Supported network commands: create, ls, inspect, connect, disconnect, rm.');
    }
    compose(args) {
      if (!this.state.files['compose.yaml']) throw new Error('No compose.yaml in this mission. Try Compose in level 15 or the sandbox.');
      const command = args.shift();
      if (command === 'config' && !args.length) { this.mark('composeValidated'); return COMPOSE + '\nnetworks:\n  default:\n    name: quest_default'; }
      if (command === 'up') {
        if (!args.length || args.some(a => !['-d', '--detach'].includes(a))) throw new Error('Practice mode supports docker compose up -d.');
        for (const name of ['quest-web-1', 'quest-cache-1']) if (this.state.containers.some(c => c.name === name && !c.compose)) throw new Error('Container name conflict: ' + name);
        if (!Object.hasOwn(this.state.networks, 'quest_default')) this.state.networks.quest_default = [];
        for (const [service, image, ports] of [['web', 'nginx:alpine', { 8080: '80' }], ['cache', 'redis:7-alpine', {}]]) {
          const existing = this.state.containers.find(c => c.name === 'quest-' + service + '-1');
          if (service === 'web' && this.state.containers.some(c => c !== existing && c.status === 'running' && c.ports['8080'])) throw new Error('Host port 8080 is already in use. Stop the other container first.');
          if (existing) existing.status = 'running';
          else this.addContainer('quest-' + service + '-1', image, 'running', { network: 'quest_default', ports, compose: true, logs: [`[${service}] service ready`] });
        }
        this.mark('composeUp'); return '✓ Network quest_default created\n✓ Container quest-web-1 running\n✓ Container quest-cache-1 running';
      }
      if (command === 'ps' && !args.length) { this.mark('composeListed'); return table(['NAME', 'SERVICE', 'STATUS', 'PORTS'], this.state.containers.filter(c => c.compose).map(c => [c.name, c.name.includes('web') ? 'web' : 'cache', c.status === 'running' ? 'Up' : 'Exited', c.ports['8080'] ? '8080->80/tcp' : '6379/tcp'])); }
      if (command === 'logs' && !args.length) return this.state.containers.filter(c => c.compose).map(c => c.name + ' | ' + c.logs.join('\n')).join('\n') || '(No Compose services running.)';
      if (command === 'down' && !args.length) { this.state.containers.filter(c => c.compose).forEach(c => this.removeContainer(c)); delete this.state.networks.quest_default; this.mark('composeDown'); return '✓ Compose containers removed\n✓ Network quest_default removed\nNamed volumes preserved.'; }
      throw new Error('Supported: docker compose config | up -d | ps | logs | down');
    }
    objectives() { return this.mission ? this.mission.objectives.map(o => !!this.check(o.test)) : []; }
    check(test) {
      const s = this.state, m = s.marks, find = name => s.containers.find(c => c.name === name), live = name => find(name)?.status === 'running';
      const tests = {
        version: () => m.version, hello: () => m.hello,
        alpineImage: () => s.images.includes('alpine:3.20') && m['pulled:alpine:3.20'], imagesListed: () => m.imagesListed,
        lighthouse: () => live('lighthouse') && find('lighthouse').detached && find('lighthouse').image === 'nginx:alpine', psListed: () => m.psListed,
        allListed: () => m.allListed, cargoInspected: () => m['inspect:cargo'],
        stoppedLighthouse: () => m['stop:lighthouse'], restartedLighthouse: () => m['restarted:lighthouse'] && live('lighthouse'),
        beaconLogs: () => m['logs:beacon'], beaconInspected: () => m['inspect:beacon'],
        vaultListed: () => m['ls:vault'], vaultRead: () => m['read:vault:/secret/flag.txt'],
        cargoRemoved: () => m['removed:cargo'] && !find('cargo'), tempRemoved: () => m['stop:temp'] && m['removed:temp'] && !find('temp'), keepAlpine: () => s.images.includes('alpine:3.20'),
        webPort: () => live('web') && find('web').image === 'nginx:alpine' && find('web').detached && find('web').ports['8080'] === '80', webReached: () => m['hostReached:web'] && live('web'),
        writerRemoved: () => m['removed:writer'] && !find('writer') && Object.hasOwn(s.volumes, 'cargo-data'), volumeRead: () => m.volumeRead,
        dockerfileRead: () => m.dockerfileRead, appBuilt: () => m['built:dock-app:v1'] && s.images.includes('dock-app:v1'), appRan: () => m['ran:dock-app:v1'],
        signalEnv: () => live('signal') && find('signal').detached && find('signal').image.startsWith('alpine:') && find('signal').env.QUEST_MODE === 'production', envRead: () => m['envRead:signal:QUEST_MODE'] && find('signal')?.env.QUEST_MODE === 'production',
        fleetCreated: () => Object.hasOwn(s.networks, 'fleet') && m['networkCreated:fleet'], apiNetwork: () => live('api') && find('api').image === 'nginx:alpine' && find('api').detached && find('api').network === 'fleet', fleetInspected: () => m['networkInspected:fleet'],
        scoutNetwork: () => live('scout') && find('scout').image.startsWith('alpine:') && find('scout').detached && find('scout').network === 'fleet', dnsReached: () => m['reached:scout:api'] && live('api') && live('scout') && find('scout').network === find('api').network,
        composeRead: () => m.composeFileRead && m.composeValidated, composeUp: () => m.composeUp && ['quest-web-1', 'quest-cache-1'].every(live), composeListed: () => m.composeListed,
        flagshipNetwork: () => Object.hasOwn(s.networks, 'fleet') && m['networkCreated:fleet'] && live('flagship') && find('flagship').network === 'fleet' && find('flagship').detached && find('flagship').image === 'nginx:alpine',
        flagshipSetup: () => live('flagship') && find('flagship').ports['8080'] === '80' && find('flagship').mounts.some(v => v.name === 'cargo-data' && v.target === '/data'),
        flagshipVerified: () => m['hostReached:flagship'] && m['inspect:flagship'] && live('flagship')
      };
      return tests[test]?.() || false;
    }
  }
  root.DQEngine = Engine;
  root.DQTokenize = tokenize;
  if (typeof module !== 'undefined' && module.exports) module.exports = { Engine, tokenize, REGISTRY };
})(globalThis);
