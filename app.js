(() => {
  'use strict';
  const { missions, zones, guide } = DQContent;
  const $ = selector => document.querySelector(selector);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const paths = {
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3m6 0h4"/>',
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
    trophy: '<path d="M7 3h10v6a5 5 0 0 1-10 0Zm0 2H3v3a4 4 0 0 0 5 4m9-7h4v3a4 4 0 0 1-5 4M12 14v6m-4 1h8"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M7 11h10M3 15v2a9 9 0 0 0 18 0v-2m-18 0 3 2m15-2-3 2"/>',
    box: '<path d="m12 3 9 5v9l-9 5-9-5V8Zm0 10 9-5M12 13v9M3 8l9 5m-4-7 9 5"/>',
    wrench: '<path d="M14 6a6 6 0 0 0-8 8L3 19a2 2 0 0 0 3 3l5-4a6 6 0 0 0 8-8l-4 4-5-5Z"/>',
    ship: '<path d="M4 13v5l8 4 8-4v-5l-8-4Zm8-4v12M7 11V5h10v6M10 5V2h4v3M2 22c2-1 3-1 5 0 2-1 3-1 5 0 2-1 3-1 5 0 2-1 3-1 5 0"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8Zm-9 10 9 5 9-5M3 18l9 5 9-5"/>',
    play: '<path d="m8 4 12 8-12 8Z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    refresh: '<path d="M20 7A9 9 0 1 0 21 14m-1-7V2m0 5h-5"/>',
    file: '<path d="M13 2H5v20h14V8Zm0 0v6h6M8 12h8M8 16h6"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14a8 3 0 0 0 16 0V5M4 12a8 3 0 0 0 16 0"/>',
    sliders: '<path d="M4 6h4m4 0h8M4 12h10m4 0h2M4 18h2m4 0h10M8 3v6m6 0v6m-8 0v6"/>',
    network: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
    route: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h8a4 4 0 0 1 0 8H9a4 4 0 0 0 0 6h8"/>',
    flag: '<path d="M5 22V3m0 0c5-3 9 3 14 0v10c-5 3-9-3-14 0"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    bolt: '<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Zm-4 10 3 3 5-6"/>',
    settings: '<path d="m9 3-1 3-3 1-2 3 2 2v3l3 1 1 3h6l1-3 3-1v-3l2-2-2-3-3-1-1-3Z"/><circle cx="12" cy="11" r="3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6"/>',
    upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    bulb: '<path d="M8 16a7 7 0 1 1 8 0v3H8Zm1 6h6M12 3v2"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v4m-4 0h8"/>',
    cloud: '<path d="M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13-1 6 6 0 0 1 0 11Z"/>',
    heart: '<path d="M12 21 3 12A6 6 0 0 1 12 4a6 6 0 0 1 9 8Z"/>',
    step: '<path d="m5 4 12 8-12 8Zm14 0v16"/>'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.box}</svg>`;
  const KEY = 'dockerquest:progress:v1';
  let storageOK = true;
  const defaults = () => ({ version: 1, completed: [], hints: {}, drafts: {}, sandboxCommands: 0, lastMission: 1, motion: !matchMedia('(prefers-reduced-motion: reduce)').matches });
  function sanitize(raw) {
    if (!raw || raw.version !== 1 || !Array.isArray(raw.completed)) throw new Error('This is not a supported Docker Quest progress file.');
    const completed = [...new Set(raw.completed)].sort((a, b) => a - b);
    if (completed.some((id, i) => !Number.isInteger(id) || id !== i + 1 || id > missions.length)) throw new Error('Progress must contain a continuous sequence of completed mission numbers, beginning at 1.');
    const result = { ...defaults(), completed };
    if (raw.hints && typeof raw.hints === 'object') missions.forEach(m => { if (Number.isInteger(raw.hints[m.id]) && raw.hints[m.id] >= 0 && raw.hints[m.id] <= 3) result.hints[m.id] = raw.hints[m.id]; });
    if (raw.drafts && typeof raw.drafts === 'object') [...missions.map(m => String(m.id)), 'sandbox'].forEach(key => {
      const d = raw.drafts[key];
      if (d && new DQEngine().validSnapshot(d.world) && Array.isArray(d.transcript)) result.drafts[key] = { world: d.world, transcript: d.transcript.filter(t => t && typeof t.text === 'string' && t.text.length < 30000 && ['command', 'output', 'error', 'welcome', 'success'].includes(t.type)).slice(-100), history: Array.isArray(d.history) ? d.history.filter(x => typeof x === 'string' && x.length < 2000).slice(-100) : [] };
    });
    result.sandboxCommands = Number.isInteger(raw.sandboxCommands) ? Math.min(Math.max(raw.sandboxCommands, 0), 100000) : 0;
    result.lastMission = Number.isInteger(raw.lastMission) && raw.lastMission >= 1 && raw.lastMission <= Math.min(completed.length + 1, 16) ? raw.lastMission : Math.min(completed.length + 1, 16);
    if (typeof raw.motion === 'boolean') result.motion = raw.motion;
    return result;
  }
  let progress;
  try { const raw = localStorage.getItem(KEY); progress = raw ? sanitize(JSON.parse(raw)) : defaults(); localStorage.setItem(KEY, JSON.stringify(progress)); }
  catch { progress = defaults(); storageOK = false; }
  let view = 'campaign', mission = null, engine = null, transcript = [], history = [], historyIndex = 0, draftCommand = '';
  let visualTopic = 'run', frame = 0, playing = false, animationTimer = null, toastTimer = null;
  let search = '';
  const narrowScreen = matchMedia('(max-width: 760px)');
  function syncMenu() {
    const sidebar = $('.sidebar');
    const hidden = narrowScreen.matches && !document.body.classList.contains('menu-open');
    if (sidebar) { sidebar.inert = hidden; sidebar.setAttribute('aria-hidden', String(hidden)); }
    $('.mobile-menu')?.setAttribute('aria-expanded', String(!hidden && narrowScreen.matches));
  }
  narrowScreen.addEventListener('change', syncMenu);
  const xp = () => missions.filter(m => progress.completed.includes(m.id)).reduce((sum, m) => sum + m.xp, 0);
  const rank = () => progress.completed.length === 16 ? 'Fleet captain' : progress.completed.length >= 12 ? 'First officer' : progress.completed.length >= 8 ? 'Engineer' : progress.completed.length >= 4 ? 'Deckhand' : 'Docker cadet';
  const nextMission = () => missions.find(m => !progress.completed.includes(m.id)) || missions[15];
  const unlocked = id => id === 1 || progress.completed.includes(id - 1);
  const navItem = (id, name, image, extra = '') => `<button data-action="nav" data-view="${id}" class="${view === id || (view === 'mission' && id === 'campaign') ? 'active' : ''}" ${view === id || (view === 'mission' && id === 'campaign') ? 'aria-current="page"' : ''}>${icon(image)}<span>${name}</span>${extra ? `<span class="nav-count">${extra}</span>` : ''}</button>`;
  function save() {
    if (engine && (view === 'mission' || view === 'sandbox')) progress.drafts[mission?.id || 'sandbox'] = { world: engine.snapshot(), transcript: transcript.slice(-100), history: history.slice(-100) };
    try { localStorage.setItem(KEY, JSON.stringify(progress)); storageOK = true; }
    catch { if (storageOK) toast('Browser storage is unavailable. Export progress to keep your voyage.'); storageOK = false; }
  }
  function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 4000); }
  function render() {
    stopAnimation();
    document.body.classList.toggle('motion-off', !progress.motion);
    const current = { campaign: 'Campaign', mission: mission?.title, sandbox: 'Sandbox', guide: 'Field guide', achievements: 'Achievements' }[view];
    $('#app').innerHTML = `<div class="shell"><button class="menu-overlay" data-action="menu" aria-label="Close navigation"></button>
      <aside class="sidebar" aria-label="Main navigation"><a href="#campaign" class="brand" data-action="home"><img src="assets/mark.svg" alt=""><div><strong>Docker Quest</strong><span>Learn. Build. Ship.</span></div></a>
      <p class="eyebrow nav-caption">Your expedition</p><nav class="nav">${navItem('campaign', 'Campaign', 'compass', '16')}${navItem('sandbox', 'Sandbox', 'terminal')}${navItem('guide', 'Field guide', 'book')}${navItem('achievements', 'Achievements', 'trophy')}</nav>
      <div class="sidebar-card">${icon('box')}<h4>Small containers. Big skills.</h4><p>Learn by doing, one mission at a time. Your next breakthrough is a command away.</p></div>
      <div class="sidebar-foot"><div class="offline-indicator"><span class="dot"></span>Offline by design</div><p>No account. No cloud. Just you.</p><div class="utility-actions"><button data-action="settings" aria-label="Settings and progress">${icon('settings')}</button><button data-action="about" aria-label="How to play">${icon('info')}</button><button data-action="export" aria-label="Export progress">${icon('download')}</button></div></div></aside>
      <header class="topbar"><button class="mobile-menu" data-action="menu" aria-label="Toggle navigation" aria-expanded="${document.body.classList.contains('menu-open')}">${icon('menu')}</button><div class="breadcrumb">Your expedition ${icon('chevron')} <strong>${escape(current)}</strong></div><div class="top-actions"><div class="xp-count">${icon('bolt')}<span id="xp-value">${xp().toLocaleString()} XP</span></div><div class="profile-mini"><span class="avatar">C</span><div>Explorer<small>${rank()}</small></div></div></div></header>
      <main class="main" id="main">${view === 'campaign' ? dashboard() : view === 'mission' || view === 'sandbox' ? lab() : view === 'guide' ? fieldGuide() : achievements()}
      <footer class="page-footer"><span>Made for curious minds. Built for the offline world.</span><span>${icon('shield')} Your progress stays on this device</span></footer></main></div>`;
    if (view === 'mission' || view === 'sandbox') { drawTerminal(); updateObjectives(); drawAnimation(); if (view === 'sandbox') drawInventory(); attachTerminalKeyboard(); }
    syncMenu();
    if (!storageOK) toast('Progress cannot be saved in this browser. Use Export progress to keep your work.');
    document.title = `${current} — Docker Quest`;
  }
  function shipArt() {
    const container = (x, y, color, light, dark) => `<g transform="translate(${x} ${y})"><path d="m0 19 54 31 54-31-54-31Z" fill="${light}"/><path d="m0 19 54 31v42L0 61Z" fill="${color}"/><path d="m54 50 54-31v42L54 92Z" fill="${dark}"/><g stroke="#102a2250" stroke-width="2"><path d="m8 27 0 32m10-26v32m10-26v32m10-26v32m10-26v32M63 49v32m10-37v32m10-37v32m10-37v32m10-37v32"/></g></g>`;
    return `<svg class="hero-art" viewBox="0 0 380 270" role="img" aria-label="A cargo ship carrying stacked containers along a dotted route"><defs><linearGradient id="hull" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#47644b"/><stop offset="1" stop-color="#243b32"/></linearGradient></defs><g fill="none" stroke="#9cbf7330"><path d="m20 203 168 65 170-92M6 222l102 39m128-14 120-52M288 55l59 31-20 12"/><path class="signal" d="M32 68C65 8 178 9 176 44S326 53 341 128" stroke="#bce57865"/><circle cx="30" cy="68" r="4" stroke="#c6f27c"/><circle cx="341" cy="129" r="4" stroke="#c6f27c"/></g><ellipse cx="204" cy="214" rx="121" ry="25" fill="#071c1830"/><path d="m51 159 135 79 144-76-136-73Z" fill="#53684d"/><path d="m51 159 135 79v25c-49-12-98-45-130-82Z" fill="url(#hull)"/><path d="m186 238 144-76-9 30c-27 28-80 62-135 71Z" fill="#203e32"/><path d="m58 166 128 73 135-72" fill="none" stroke="#9bb98070" stroke-width="2"/><g class="float-cargo">${container(103, 112, '#698855', '#aac482', '#48633d')}${container(158, 81, '#82a86a', '#c3db94', '#5a8052')}${container(158, 37, '#a7c879', '#d5eaa8', '#739859')}</g><g class="float-cargo second">${container(49, 79, '#87aa66', '#bddb8c', '#5a7d48')}</g><path d="m242 148 24-13 21 12-23 14Z" fill="#adbd98"/><path d="m242 148 22 13v30l-22-12Z" fill="#799174"/><path d="m264 161 23-14v30l-23 14Z" fill="#516e52"/><path d="m248 153 10 6v7l-10-6m21 2 11-6v7l-11 6" fill="#20392d"/><path d="M220 29v18m-9-9h18" stroke="#c6f27c60"/><circle cx="300" cy="41" r="2" fill="#c6f27c60"/><circle cx="88" cy="35" r="2" fill="#c6f27c60"/></svg>`;
  }
  function dashboard() {
    const next = nextMission(), all = progress.completed.length === 16;
    return `<div class="page-head"><div><p class="eyebrow">A little practice. A lot of possibility.</p><h1>${progress.completed.length ? 'Welcome back, explorer.' : 'Ready to learn Docker?'}</h1><p>From your first container to a fleet of services. One flag at a time.</p></div><button class="text-button" data-action="about">How it works ${icon('arrow')}</button></div>
      <div class="dashboard-grid"><div><section class="card hero"><div class="hero-copy"><div class="eyebrow">Your hands-on adventure</div><h2>Build skills.<br>Ship <em>containers.</em></h2><p>Real commands. Visual explanations.<br>16 missions to turn Docker from<br>a mystery into muscle memory.</p><button class="button" data-action="mission" data-id="${next.id}">${all ? 'Revisit the final challenge' : progress.drafts[next.id] ? 'Resume your adventure' : progress.completed.length ? 'Continue your adventure' : 'Start your adventure'} ${icon('arrow')}</button></div>${shipArt()}<span class="hero-tag"><span class="dot"></span> LOCAL ENGINE · READY</span></section>
      <div class="stats-strip"><div class="stat-item">${icon('flag')}<div><div class="stat-value">${progress.completed.length} / 16</div><div class="stat-label">Flags captured</div></div></div><div class="stat-item">${icon('layers')}<div><div class="stat-value">4 chapters</div><div class="stat-label">One complete journey</div></div></div><div class="stat-item">${icon('clock')}<div><div class="stat-value">At your pace</div><div class="stat-label">No timers. No pressure.</div></div></div></div>
      <div class="learning-head"><h2>Your learning path</h2><span>Start small. Level up. Set sail.</span></div><div class="zones">${zones.map((z, i) => {
        const levels = missions.filter(m => m.zone === z.id), done = levels.filter(m => progress.completed.includes(m.id)).length;
        return `<section class="card zone-card ${z.color}"><div class="zone-head"><div class="zone-top"><div class="zone-icon">${icon(z.icon)}</div><span class="chapter">CHAPTER 0${i + 1} / 04</span></div><h3>${z.name}</h3><p class="subtitle">${z.subtitle}</p><div class="zone-progress" role="progressbar" aria-label="${z.name} progress" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="4"><span style="width:${done * 25}%"></span></div></div><div class="level-list">${levels.map(m => {
          const complete = progress.completed.includes(m.id), current = m.id === next.id && !all, open = unlocked(m.id);
          return `<button class="level-row ${complete ? 'complete' : current ? 'current' : ''}" data-action="mission" data-id="${m.id}" ${open ? '' : 'disabled'} aria-label="Mission ${m.id}: ${m.title}${complete ? ', complete' : !open ? ', locked; complete the previous mission' : ''}"><span class="level-num">${complete ? icon('check') : String(m.id).padStart(2, '0')}</span><span class="level-title">${m.title}</span><span class="level-time">${m.minutes}m</span>${icon(!open ? 'lock' : 'chevron')}</button>`;
        }).join('')}</div></section>`;
      }).join('')}</div><p class="bottom-note">${icon('info')} Capture a flag to unlock the next mission. Replay any completed mission, anytime.</p></div>${voyage()}</div>`;
  }
  function voyage() {
    const completed = progress.completed.length, circumference = 389.56;
    return `<aside class="card voyage"><h3>Your voyage</h3><div class="progress-ring"><svg viewBox="0 0 144 144" aria-hidden="true"><circle cx="72" cy="72" r="62"/><circle class="value" cx="72" cy="72" r="62" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference * (1 - completed / 16)}"/></svg><div class="ring-content"><strong>${completed}</strong><span> / 16</span><small>missions completed</small></div></div><div class="rank-title"><h4>${rank()}</h4><p>${completed === 16 ? 'The whole ocean is yours.' : 'From cadet to captain, command by command.'}</p></div><div class="voyage-divider"></div><p class="eyebrow">Your skill cargo</p>${zones.map(z => { const done = missions.filter(m => m.zone === z.id && progress.completed.includes(m.id)).length; return `<div class="skill-row ${z.color}"><div class="skill-meta"><span>${z.topic}</span><span>${done}/4</span></div><div class="skill-track"><span style="width:${done * 25}%"></span></div></div>`; }).join('')}<div class="voyage-divider"></div><p class="eyebrow">Milestones ahead</p><div class="mini-badges">${[['First launch', 'bolt', 1], ['Image builder', 'layers', 11], ['Fleet captain', 'trophy', 16]].map(([name, img, level]) => `<div class="mini-badge ${progress.completed.includes(level) ? 'earned' : ''}"><div class="badge-icon">${icon(img)}</div>${name}</div>`).join('')}</div><p class="voyage-note">A good engineer is just a curious beginner who kept going.</p></aside>`;
  }
  const visuals = {
    run: { title: 'From image to container', nodes: [['terminal', 'Your terminal', 'docker run'], ['cloud', 'Registry', 'image source'], ['layers', 'Local image', 'read-only'], ['box', 'Container', 'isolated process']], frames: ['You send a command to the Docker engine.', 'The engine pulls a missing image from its registry.', 'The image is cached as read-only filesystem layers.', 'Docker creates a container and starts its main process.'] },
    image: { title: 'A blueprint in layers', nodes: [['cloud', 'Registry', 'alpine:3.20'], ['download', 'Pull', 'download layers'], ['layers', 'Image cache', 'on your host'], ['box', 'Ready to run', 'no process yet']], frames: ['Choose a tagged image in the registry.', 'Pull downloads the required layers.', 'Docker stores the image on your machine.', 'You have a blueprint. Run creates its container.'] },
    lifecycle: { title: 'The life of a container', nodes: [['box', 'Created', 'new instance'], ['play', 'Running', 'process alive'], ['pause', 'Stopped', 'layer retained'], ['trash', 'Removed', 'layer deleted']], frames: ['Create a container from an image.', 'Start its process. Running containers appear in docker ps.', 'Stop its process. Its filesystem and identity remain.', 'Remove the container. The source image stays cached.'] },
    logs: { title: 'Follow the signal', nodes: [['box', 'Application', 'in container'], ['file', 'stdout / stderr', 'process output'], ['database', 'Docker logs', 'captured output'], ['terminal', 'Your terminal', 'docker logs']], frames: ['The container’s application runs.', 'It writes messages to standard output and error.', 'Docker captures those output streams.', 'You read them with docker logs.'] },
    exec: { title: 'A process inside a process space', nodes: [['terminal', 'Your terminal', 'docker exec'], ['sliders', 'Engine', 'exec request'], ['box', 'Container', 'new process'], ['file', 'Filesystem', 'container paths']], frames: ['Ask Docker to execute a command in a running container.', 'The engine finds the container and its environment.', 'It starts an extra process inside that container.', 'The command reads its filesystem and returns the output.'] },
    ports: { title: 'Follow an HTTP request', nodes: [['globe', 'Your browser', 'localhost:8080'], ['monitor', 'Host port', '8080'], ['route', 'Port mapping', '8080 → 80'], ['box', 'Web service', 'container :80']], frames: ['A request starts at http://localhost:8080.', 'Your host receives the request on port 8080.', 'The published port forwards the request to port 80.', 'The Nginx container sends back an HTTP response.'] },
    volume: { title: 'Data that outlives a container', nodes: [['box', 'Writer', 'writes the flag'], ['database', 'cargo-data', 'named volume'], ['trash', 'Remove writer', 'volume stays'], ['box', 'Reader', 'mount at /data']], frames: ['Writer saves a file in its mounted volume.', 'The data lives in cargo-data, outside the writable layer.', 'Remove writer. The named volume still exists.', 'A fresh reader mounts the same volume and reads the file.'] },
    build: { title: 'Build a reusable blueprint', nodes: [['layers', 'FROM', 'base image'], ['file', 'WORKDIR / COPY', 'add your files'], ['terminal', 'CMD', 'startup command'], ['box', 'Your image', 'dock-app:v1']], frames: ['FROM selects the Alpine base image.', 'WORKDIR and COPY set up the application files.', 'CMD defines what to run when the container starts.', 'The build produces an image. Run uses it to create a container.'] },
    env: { title: 'Same image, new configuration', nodes: [['layers', 'Image', 'same blueprint'], ['sliders', 'Environment', '-e KEY=value'], ['box', 'Container', 'process config'], ['terminal', 'Read the value', 'printenv']], frames: ['Begin with the same image.', 'Set an environment variable when creating the container.', 'The process starts with that configuration.', 'Use printenv through exec to read its value.'] },
    network: { title: 'Containers talking by name', nodes: [['box', 'Scout', 'client container'], ['network', 'Docker DNS', 'api → address'], ['route', 'fleet network', 'private bridge'], ['box', 'API service', 'internal :80']], frames: ['Scout requests a service on its network.', 'Docker DNS resolves the name api to an address.', 'The packet crosses the user-defined bridge network.', 'The API replies using its internal port, without a host mapping.'] },
    compose: { title: 'One manifest, a whole fleet', nodes: [['file', 'compose.yaml', 'service manifest'], ['network', 'Default network', 'shared bridge'], ['box', 'Web service', 'nginx:alpine'], ['database', 'Cache service', 'redis:7-alpine']], frames: ['The Compose manifest describes the services.', 'Compose sets up their shared network.', 'It starts a separate container for the web service.', 'It starts cache too. The fleet can be managed together.'] },
    boss: { title: 'Everything you have learned', nodes: [['layers', 'Build', 'dock-app:v1'], ['network', 'Connect', 'fleet network'], ['database', 'Persist & publish', 'volume + port'], ['flag', 'Verify', 'ready to ship']], frames: ['Build an application image from a Dockerfile.', 'Create a network and start the flagship service.', 'Mount its persistent storage and publish the HTTP port.', 'Verify the response and inspect its state. Capture your final flag.'] }
  };
  // Each mission's four stages follow its actual explanation, rather than a generic sequence.
  const missionNodes = {
    1: [['terminal', 'Command', 'client → engine'], ['cloud', 'Find the image', 'hello-world'], ['box', 'Create & run', 'main process'], ['pause', 'Process exits', 'container stays']],
    2: [['cloud', 'Registry', 'alpine:3.20'], ['download', 'Pull layers', 'local download'], ['layers', 'Image cache', 'read-only'], ['check', 'Blueprint ready', 'no container']],
    3: [['layers', 'Choose image', 'nginx:alpine'], ['box', 'Create', 'lighthouse'], ['play', 'Service runs', 'nginx process'], ['terminal', 'Detach', 'terminal is free']],
    4: [['pause', 'Cargo exits', 'process finished'], ['search', 'Running list', 'docker ps'], ['box', 'All containers', 'docker ps -a'], ['file', 'Inspect state', 'exit code 0']],
    5: [['play', 'Running', 'lighthouse'], ['pause', 'Graceful stop', 'SIGTERM'], ['layers', 'Retained state', 'writable layer'], ['refresh', 'Start again', 'same container']],
    6: [['box', 'Application', 'writes stdout'], ['file', 'Capture output', 'Docker logs'], ['terminal', 'Read messages', 'docker logs'], ['search', 'Add context', 'docker inspect']],
    8: [['box', 'Cargo stopped', 'ready to remove'], ['pause', 'Stop temp', 'process exits'], ['trash', 'Remove both', 'layers deleted'], ['layers', 'Image remains', 'alpine:3.20']],
    10: [['box', 'Writer saves', '/data/flag.txt'], ['trash', 'Remove writer', 'private layer gone'], ['database', 'Volume remains', 'cargo-data'], ['box', 'Reader mounts', '/data/flag.txt']],
    13: [['network', 'Create network', 'fleet bridge'], ['box', 'Attach API', '--network fleet'], ['route', 'Assign address', 'container IP'], ['globe', 'Resolve names', 'Docker DNS']]
  };
  function lab() {
    const sandbox = view === 'sandbox', complete = mission && progress.completed.includes(mission.id);
    return `<div class="mission-title-row"><div><p class="eyebrow">${sandbox ? 'A safe place to experiment' : 'Chapter ' + (zones.findIndex(z => z.id === mission.zone) + 1) + ' · Mission ' + String(mission.id).padStart(2, '0')}</p><h1 style="margin-top:9px">${sandbox ? 'Your container playground.' : mission.title}</h1><p>${sandbox ? 'Try a command. Watch what changes. Make it yours.' : mission.subtitle}</p><div class="mission-tags"><span class="pill">${icon(sandbox ? 'shield' : 'flag')}${sandbox ? 'Free practice' : complete ? 'Flag captured' : '+' + mission.xp + ' XP'}</span><span class="pill neutral">${icon('terminal')}Simulated Docker</span>${sandbox ? '' : `<span class="pill neutral">${icon('clock')}~${mission.minutes} min</span>`}</div></div><button class="button ghost small" data-action="reset-lab">${icon('refresh')}Reset ${sandbox ? 'sandbox' : 'mission'}</button></div>
      ${complete ? `<div class="completion-banner"><div><h3>Flag captured. Skill unlocked.</h3><p>You can replay this mission without changing your earned XP.</p></div><button class="button small" data-action="${mission.id < 16 ? 'mission' : 'nav'}" ${mission.id < 16 ? `data-id="${mission.id + 1}"` : 'data-view="achievements"'}>${mission.id < 16 ? 'Next mission' : 'Your achievements'} ${icon('arrow')}</button></div>` : ''}
      ${sandbox ? `<div class="card sandbox-note">${icon('info')}<div>This terminal simulates Docker locally. The included image registry, files, and services work without a connection. Type <code>help</code> to see supported commands. Builds use the bundled, fixed Dockerfile.</div></div>` : ''}
      <div class="mission-layout"><div class="workbench"><section class="card animation-card"><header class="panel-header"><div class="panel-title">${icon('layers')}Under the hood</div><small>Interactive explainer</small></header><div id="animation" role="group" aria-label="Animated Docker explanation"></div></section>
      <section class="card terminal" aria-label="Simulated Docker terminal"><header class="panel-header"><div class="panel-title"><div class="terminal-dots" aria-hidden="true"><span></span><span></span><span></span></div><span class="terminal-title">cadet@dockerquest: ~/mission</span></div><small>PRACTICE ENGINE</small></header><div id="terminal-log" class="terminal-log" role="log" aria-label="Command output" aria-live="polite" aria-relevant="additions text"></div><form id="command-form" class="terminal-input-row" autocomplete="off"><label class="terminal-prompt" for="command-input">cadet $</label><input id="command-input" name="command" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Docker command" placeholder="${mission?.id === 1 ? 'Type docker version to begin...' : 'Type a command, or help...'}" maxlength="2000"><button type="submit" class="terminal-enter" aria-label="Run command">↵</button></form></section><div class="terminal-hint"><span><kbd>↑</kbd> <kbd>↓</kbd> command history</span><span><kbd>Tab</kbd> suggestions</span><span><kbd>Ctrl</kbd> + <kbd>L</kbd> clear</span></div></div>
      <aside class="mission-right">${sandbox ? `<section class="card inventory"><h3>Engine inventory</h3><div id="inventory" aria-live="polite"></div></section><section class="card notes-card"><h3>${icon('bulb')}Try a little experiment</h3><p>Start a service, publish a port, then stop it and try the same request. What changes? These recipes fill the terminal; you run them.</p><div class="recipe-list">${[['Start a web service', 'docker run -d --name web -p 8080:80 nginx:alpine'], ['Check the response', 'curl http://localhost:8080'], ['Explore persistent storage', 'docker volume create cargo-data'], ['Build an image', 'docker build -t dock-app:v1 .']].map(([label, cmd]) => `<button data-action="recipe" data-command="${escape(cmd)}">${label}${icon('arrow')}</button>`).join('')}</div></section>` : `<section class="card objectives-card"><h3>Mission briefing</h3><p class="brief-text">${mission.brief}</p><div class="objectives-heading"><span>Your objectives</span><span id="objective-count" class="objective-count">0/${mission.objectives.length}</span></div><ul id="objective-list" class="objective-list"></ul><div class="hint-area"><button class="hint-toggle" data-action="hint"><span>${icon('bulb')}Need a nudge?</span><span id="hint-label">Reveal hint</span></button><div id="hint-body"></div></div></section>
      <section class="card capture-card"><h3>${icon('flag')}Capture the flag</h3><p>Complete the objectives, then type <code>claim</code> in the terminal to reveal your flag. Found a flag in a file? Use it here.</p><form id="flag-form" class="flag-form"><input id="flag-input" aria-label="Mission flag" name="flag" placeholder="DOCK{your_flag_here}" autocomplete="off" spellcheck="false" maxlength="100"><button class="button" type="submit">Capture</button></form><div id="flag-status" class="flag-status" aria-live="polite">${complete ? 'Already captured. Replay as often as you like.' : 'Your next mission is waiting on the other side.'}</div></section><section class="card notes-card"><h3>${icon('book')}The idea to take with you</h3><p>${mission.lesson}</p><button class="text-button" data-action="nav" data-view="guide">Open the field guide ${icon('arrow')}</button></section>`}</aside></div>`;
  }
  function fieldGuide() {
    return `<div class="page-head guide-head"><div><p class="eyebrow">Good tools for your back pocket</p><h1>The field guide.</h1><p>Commands, concepts, and a little clarity. Always available offline.</p></div><input class="guide-search" id="guide-search" type="search" aria-label="Search the field guide" placeholder="Find a command or concept..." value="${escape(search)}"></div><div class="guide-grid" id="guide-grid">${guideCards()}</div>`;
  }
  function guideCards() {
    const filtered = guide.filter(row => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
    return filtered.length ? filtered.map(([title, description, commands]) => `<section class="card guide-card"><h3>${title}</h3><p>${description}</p>${commands.map(([cmd, explanation]) => `<div class="guide-command"><button data-action="copy" data-command="${escape(cmd)}" aria-label="Copy ${escape(cmd)}">${icon('copy')}</button><code>${escape(cmd)}</code><span>${explanation}</span></div>`).join('')}</section>`).join('') : '<p class="empty-state">No matching commands. Try “volume”, “run”, or “network”.</p>';
  }
  const badgeData = () => [
    { name: 'First launch', icon: 'bolt', desc: 'Run your first container and capture your first flag.', earned: progress.completed.includes(1) },
    { name: 'Harbor explorer', icon: 'anchor', desc: 'Complete all four Docker foundation missions.', earned: progress.completed.includes(4) },
    { name: 'Dockyard detective', icon: 'search', desc: 'Master container lifecycle, logs, and filesystem clues.', earned: progress.completed.includes(8) },
    { name: 'Image builder', icon: 'layers', desc: 'Build and run your very own Docker image.', earned: progress.completed.includes(11) },
    { name: 'Systems engineer', icon: 'wrench', desc: 'Complete the ports, persistence, build, and configuration chapter.', earned: progress.completed.includes(12) },
    { name: 'Fleet commander', icon: 'network', desc: 'Launch a multi-service stack using Compose.', earned: progress.completed.includes(15) },
    { name: 'Fleet captain', icon: 'trophy', desc: 'Capture all 16 flags and complete the final challenge.', earned: progress.completed.includes(16) },
    { name: 'Curious mind', icon: 'compass', desc: 'Run five successful commands in the sandbox.', earned: progress.sandboxCommands >= 5 },
    { name: 'Own your course', icon: 'flag', desc: 'Complete a mission without revealing any hints.', earned: progress.completed.some(id => !progress.hints[id]) }
  ];
  function achievements() {
    const badges = badgeData();
    return `<div class="page-head"><div><p class="eyebrow">Proof of a little persistence</p><h1>Skills worth celebrating.</h1><p>${badges.filter(b => b.earned).length} of ${badges.length} milestones earned · ${xp().toLocaleString()} XP · ${rank()}</p></div><button class="button ghost small" data-action="export">${icon('download')}Export progress</button></div><div class="achievements-grid">${badges.map(b => `<section class="card achievement ${b.earned ? 'earned' : ''}"><div class="achievement-medal">${icon(b.icon)}</div><h3>${b.name}</h3><p>${b.desc}</p><div class="achievement-status">${icon(b.earned ? 'check' : 'lock')}${b.earned ? 'Achievement unlocked' : 'A milestone ahead'}</div></section>`).join('')}</div>`;
  }
  function openMission(id) {
    id = Number(id); const target = missions.find(m => m.id === id);
    if (!target || !unlocked(id)) { toast('Capture the previous flag to unlock this mission.'); return; }
    save(); mission = target; view = 'mission'; progress.lastMission = id;
    loadLab(); render(); save(); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function loadLab(reset = false) {
    const saved = reset ? null : progress.drafts[mission?.id || 'sandbox'];
    engine = new DQEngine(mission, saved?.world);
    transcript = saved?.transcript?.length ? saved.transcript.slice() : [{ type: 'welcome', text: `Docker Quest · Offline practice engine\n${mission ? 'Mission ' + String(mission.id).padStart(2, '0') + ': ' + mission.title : 'Sandbox: your own little Docker universe.'}\n\n${mission?.id === 1 ? 'Start with docker version. Type help if you get stuck.' : 'Type help for commands. The field guide is always available.'}\nAll output and services in this terminal are simulated.` }];
    history = saved?.history?.slice() || []; historyIndex = history.length; visualTopic = mission?.topic || 'run'; frame = 0;
  }
  function navigate(target) {
    if (!['campaign', 'sandbox', 'guide', 'achievements'].includes(target)) return;
    save(); view = target; mission = null;
    if (target === 'sandbox') loadLab(); else engine = null;
    document.body.classList.remove('menu-open'); render(); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function appendLine(entry) {
    const line = document.createElement('pre');
    line.className = 'terminal-line ' + entry.type;
    if (entry.type === 'command') line.innerHTML = `<span class="prompt">cadet $</span> ${escape(entry.text)}`;
    else line.textContent = entry.text;
    $('#terminal-log').append(line);
  }
  function drawTerminal() {
    const log = $('#terminal-log'); if (!log) return;
    log.replaceChildren(); transcript.forEach(appendLine); log.scrollTop = log.scrollHeight;
  }
  function runCommand(input) {
    input = input.trim(); if (!input || !engine) return;
    history.push(input); history = history.slice(-100); historyIndex = history.length; draftCommand = '';
    const commandEntry = { type: 'command', text: input }; transcript.push(commandEntry); appendLine(commandEntry);
    const result = engine.execute(input);
    if (result.clear) { transcript = []; drawTerminal(); }
    else if (result.output) { const entry = { type: result.error ? 'error' : result.flag ? 'success' : 'output', text: result.output }; transcript.push(entry); appendLine(entry); }
    transcript = transcript.slice(-100); if ($('#terminal-log').children.length > 100) drawTerminal();
    $('#terminal-log').scrollTop = $('#terminal-log').scrollHeight;
    $('#command-input').value = '';
    if (!result.error && !result.clear) {
      if (view === 'sandbox') progress.sandboxCommands++;
      if (result.topic) visualTopic = view === 'mission' ? mission.topic : result.topic;
      frame = 0; drawAnimation(); playAnimation();
    }
    updateObjectives(); if (view === 'sandbox') drawInventory(); save();
  }
  function updateObjectives() {
    if (!mission || !$('#objective-list')) return;
    const results = engine.objectives();
    $('#objective-list').innerHTML = mission.objectives.map((o, i) => `<li class="${results[i] ? 'done' : ''}"><span class="objective-check" aria-label="${results[i] ? 'Complete' : 'Incomplete'}">${results[i] ? icon('check') : ''}</span><span>${escape(o.text)}</span></li>`).join('');
    $('#objective-count').textContent = results.filter(Boolean).length + '/' + results.length;
    if (results.every(Boolean) && !progress.completed.includes(mission.id)) { $('#flag-status').className = 'flag-status success'; $('#flag-status').textContent = 'All objectives complete. Type claim to retrieve your flag.'; }
    renderHints();
  }
  function renderHints() {
    if (!mission || !$('#hint-body')) return;
    const count = progress.hints[mission.id] || 0;
    $('#hint-label').textContent = count === 3 ? 'All hints revealed' : count ? `Next hint (${count}/3)` : 'Reveal hint';
    $('#hint-body').innerHTML = count ? `<div class="hint-content"><code>${escape(mission.hints[count - 1])}</code></div><p class="hint-meta">Hint ${count}/3 · Hints never reduce your XP.</p>` : '';
  }
  function captureFlag(value) {
    if (!mission) return;
    const status = $('#flag-status');
    if (!engine.objectives().every(Boolean)) { status.className = 'flag-status error'; status.textContent = 'Complete every objective before capturing this flag.'; return; }
    if (value.trim() !== mission.flag) { status.className = 'flag-status error'; status.textContent = 'That flag does not match. Type claim, then copy the full DOCK{...} token.'; return; }
    const already = progress.completed.includes(mission.id);
    if (!already) progress.completed.push(mission.id);
    save(); render();
    if (already) { toast('Correct flag. You already earned this mission’s XP.'); return; }
    celebrate();
    const next = mission.id < 16 ? missions[mission.id] : null;
    modal(`<div class="modal-success"><div class="achievement-medal">${icon(mission.id === 16 ? 'trophy' : 'flag')}</div><p class="eyebrow">Mission ${String(mission.id).padStart(2, '0')} complete</p><h2 style="margin-top:9px">${next ? 'A flag captured.<br>A skill for life.' : 'You’re ready to ship.'}</h2><p class="modal-copy">${next ? `You completed ${escape(mission.title)}<br>Next stop: ${escape(next.title)}` : 'All 16 missions complete. From your first container to a fleet of services — you earned your captain’s stripes.'}</p><div class="reward-line">+${mission.xp} XP · ${xp().toLocaleString()} XP TOTAL</div><div class="flag-display">${mission.flag}</div><div class="modal-actions"><button class="button" data-action="${next ? 'next' : 'show-achievements'}" ${next ? `data-id="${next.id}"` : ''}>${next ? 'Next mission' : 'View achievements'}${icon('arrow')}</button><button class="button secondary" data-action="close-modal">Take a breather</button></div></div>`);
  }
  function drawAnimation() {
    const el = $('#animation'); if (!el) return;
    const base = visuals[visualTopic] || visuals.run;
    const data = { ...base, nodes: missionNodes[mission?.id] || base.nodes };
    const captions = mission?.frames || data.frames;
    el.innerHTML = `<div class="diagram-stage"><div class="diagram-nodes" role="img" aria-label="${escape(data.title)}. ${data.nodes.map(n => n[1]).join(' → ')}">${data.nodes.map(([img, label, detail], i) => `<div class="diagram-node ${i <= frame ? 'reached' : ''} ${i === frame ? 'active' : ''}"><div class="node-body">${icon(img)}<span class="node-step">${i + 1}</span></div><div class="node-label">${label}</div><div class="node-detail">${detail}</div></div>${i < 3 ? `<span class="diagram-arrow ${i === frame && playing ? 'flow' : ''}"></span>` : ''}`).join('')}</div></div><div class="animation-caption"><p class="frame-caption" aria-live="polite">${escape(captions[frame])}</p><div class="animation-controls"><button data-action="animate" aria-label="${playing ? 'Pause' : frame === 3 ? 'Replay' : 'Play'} animation">${icon(playing ? 'pause' : frame === 3 ? 'refresh' : 'play')}${playing ? 'Pause' : frame === 3 ? 'Replay' : 'Play explanation'}</button><div class="step-dots">${captions.map((_, i) => `<button data-action="frame" data-frame="${i}" class="${i === frame ? 'active' : ''}" aria-label="Step ${i + 1}" aria-pressed="${i === frame}"></button>`).join('')}</div><button data-action="next-frame" aria-label="Next explanation step">${frame + 1}/4${icon('step')}</button></div></div>`;
  }
  function stopAnimation() { clearInterval(animationTimer); animationTimer = null; playing = false; }
  function playAnimation() {
    stopAnimation(); if (!progress.motion || matchMedia('(prefers-reduced-motion: reduce)').matches) { drawAnimation(); return; }
    if (frame === 3) frame = 0; playing = true; drawAnimation();
    animationTimer = setInterval(() => { frame++; if (frame >= 3) { frame = 3; stopAnimation(); } drawAnimation(); }, 2200);
  }
  function drawInventory() {
    const el = $('#inventory'); if (!el) return;
    const s = engine.state;
    const group = (name, entries, img) => `<div class="inventory-group"><p class="eyebrow">${name} · ${entries.length}</p>${entries.length ? entries.map(([label, detail]) => `<div class="inventory-row">${icon(img)}<span>${escape(label)}</span><span>${escape(detail)}</span></div>`).join('') : '<p class="inventory-empty">Nothing here yet.</p>'}</div>`;
    el.innerHTML = group('Containers', s.containers.map(c => [c.name, c.status]), 'box') + group('Images', s.images.map(i => [i, 'cached']), 'layers') + group('Volumes', Object.keys(s.volumes).map(v => [v, 'local']), 'database') + group('Networks', Object.entries(s.networks).map(([name, ids]) => [name, ids.length + ' members']), 'network');
  }
  function attachTerminalKeyboard() {
    const input = $('#command-input'); if (!input) return;
    input.addEventListener('keydown', event => {
      if (event.key === 'ArrowUp') { event.preventDefault(); if (historyIndex === history.length) draftCommand = input.value; historyIndex = Math.max(0, historyIndex - 1); input.value = history[historyIndex] || ''; }
      if (event.key === 'ArrowDown') { event.preventDefault(); historyIndex = Math.min(history.length, historyIndex + 1); input.value = historyIndex === history.length ? draftCommand : history[historyIndex] || ''; }
      if (event.ctrlKey && event.key.toLowerCase() === 'l') { event.preventDefault(); runCommand('clear'); }
      if (event.key === 'Tab' && input.value.trim()) {
        event.preventDefault();
        const suggestions = ['docker version', 'docker info', 'docker run ', 'docker pull ', 'docker images', 'docker ps', 'docker ps -a', 'docker stop ', 'docker start ', 'docker logs ', 'docker inspect ', 'docker exec ', 'docker build -t ', 'docker network create ', 'docker volume create ', 'docker compose up -d', 'docker compose ps', 'claim', 'clear', 'help'];
        const matches = suggestions.filter(x => x.startsWith(input.value));
        if (matches.length === 1) input.value = matches[0];
        else if (matches.length > 1) toast('Suggestions: ' + matches.slice(0, 5).join(' · '));
        else toast('No matching command. Type help to see the command list.');
      }
    });
  }
  function modal(html, title = '') {
    const el = $('#modal');
    el.innerHTML = `${title ? `<div class="modal-header"><h2 id="dialog-title">${title}</h2><button class="modal-close" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button></div>` : ''}${html}`;
    el.setAttribute('aria-label', title || 'Mission complete'); if (!el.open) el.showModal();
  }
  function closeModal() { $('#modal').close(); }
  function about() {
    modal(`<p class="modal-copy">You’re a cadet in a container harbor. Work through 16 missions, capture their flags, and earn your way to fleet captain.</p><div class="setting-row"><div><strong>01 · Learn by doing</strong><small>Read the briefing. Enter commands in the practice terminal.</small></div>${icon('terminal')}</div><div class="setting-row"><div><strong>02 · See how it works</strong><small>Play the explainer or step through the animated diagram.</small></div>${icon('layers')}</div><div class="setting-row"><div><strong>03 · Capture your flag</strong><small>Complete the objectives, run claim, and submit the token.</small></div>${icon('flag')}</div><p class="modal-copy" style="margin-top:16px">The game runs entirely on this device. The Docker engine, image pulls, and HTTP requests are simulated. It never executes commands on your computer. Your progress saves automatically; export it for a backup.</p><div class="modal-actions"><button class="button" data-action="close-modal">Let’s explore ${icon('arrow')}</button></div>`, 'Welcome aboard.');
  }
  function settings() {
    modal(`<label class="setting-row"><div><strong>Animated explanations</strong><small>Turn motion off to advance diagrams manually.</small></div><input type="checkbox" id="motion-setting" ${progress.motion ? 'checked' : ''}></label><div class="setting-row"><div><strong>Progress backup</strong><small>Take your voyage to another browser or device.</small></div></div><div class="modal-actions"><button class="button secondary" data-action="export">${icon('download')}Export progress</button><button class="button secondary" data-action="import">${icon('upload')}Import progress</button></div>${!storageOK ? '<p class="storage-warning">Browser storage is unavailable. Export before closing the app.</p>' : ''}<hr class="modal-divider"><p class="modal-copy">Resetting your campaign clears all flags, XP, lab states, and achievements on this browser. Export a backup first if you want to keep them.</p><div class="modal-actions"><button class="button danger small" data-action="confirm-reset">Reset campaign</button></div><input class="file-input" type="file" id="progress-file" accept="application/json,.json">`, 'Make it your voyage.');
  }
  function exportProgress() {
    save(); const payload = { ...progress, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'docker-quest-progress.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 5000); toast('Progress exported. Keep this file as your voyage backup.');
  }
  async function importProgress(file) {
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error('This file is too large. Progress files must be smaller than 2 MB.');
      const incoming = sanitize(JSON.parse(await file.text()));
      modal(`<p class="modal-copy">This backup contains <strong>${incoming.completed.length} completed missions</strong>. Importing will replace the progress currently saved in this browser.</p><div class="modal-actions"><button class="button" id="apply-import">Import this backup</button><button class="button secondary" data-action="close-modal">Cancel</button></div>`, 'Restore your voyage?');
      $('#apply-import').addEventListener('click', () => { progress = incoming; engine = null; mission = null; view = 'campaign'; closeModal(); save(); render(); toast('Progress restored. Welcome back aboard.'); }, { once: true });
    } catch (error) { toast('Could not import: ' + error.message); }
  }
  async function copyCommand(text) {
    try { if (!navigator.clipboard?.writeText) throw new Error('Unavailable'); await navigator.clipboard.writeText(text); toast('Command copied.'); }
    catch { modal(`<p class="modal-copy">Select this command and copy it with Ctrl+C (or your device’s copy action).</p><input style="width:100%;margin-top:15px;padding:11px;background:#112015;border:1px solid #536d41;border-radius:7px;color:var(--lime);font:11px var(--mono)" aria-label="Command to copy" id="copy-fallback" readonly value="${escape(text)}">`, 'Copy a command'); $('#copy-fallback').select(); }
  }
  function celebrate() {
    if (!progress.motion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const wrap = document.createElement('div'); wrap.className = 'confetti'; wrap.setAttribute('aria-hidden', 'true');
    const colors = ['#c6f27c', '#95cddd', '#eab591', '#b7a2e4'];
    wrap.innerHTML = Array.from({ length: 38 }, (_, i) => `<i style="--left:${Math.random() * 100}%;--color:${colors[i % 4]};--duration:${2 + Math.random() * 2}s;--delay:${Math.random() * .5}s"></i>`).join(''); document.body.append(wrap); setTimeout(() => wrap.remove(), 5000);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]'); if (!button || button.disabled) return;
    const action = button.dataset.action;
    switch (action) {
      case 'nav': navigate(button.dataset.view); break;
      case 'home': event.preventDefault(); navigate('campaign'); break;
      case 'mission': document.body.classList.remove('menu-open'); openMission(button.dataset.id); break;
      case 'menu': document.body.classList.toggle('menu-open'); syncMenu(); break;
      case 'about': about(); break;
      case 'settings': settings(); break;
      case 'close-modal': closeModal(); break;
      case 'next': closeModal(); openMission(button.dataset.id); break;
      case 'show-achievements': closeModal(); navigate('achievements'); break;
      case 'export': exportProgress(); break;
      case 'import': $('#progress-file')?.click(); break;
      case 'copy': copyCommand(button.dataset.command); break;
      case 'recipe': $('#command-input').value = button.dataset.command; $('#command-input').focus(); break;
      case 'hint': if (mission) { progress.hints[mission.id] = Math.min((progress.hints[mission.id] || 0) + 1, 3); renderHints(); save(); } break;
      case 'animate': if (playing) { stopAnimation(); drawAnimation(); } else playAnimation(); break;
      case 'frame': stopAnimation(); frame = Number(button.dataset.frame); drawAnimation(); break;
      case 'next-frame': stopAnimation(); frame = (frame + 1) % 4; drawAnimation(); break;
      case 'reset-lab': modal(`<p class="modal-copy">This will restore this ${mission ? 'mission' : 'sandbox'} to its starting state and clear its command history. Earned flags and XP are kept.</p><div class="modal-actions"><button class="button" data-action="apply-lab-reset">Reset lab</button><button class="button secondary" data-action="close-modal">Keep practicing</button></div>`, 'A fresh workspace?'); break;
      case 'apply-lab-reset': closeModal(); stopAnimation(); loadLab(true); save(); render(); toast('Lab reset. A clean slate awaits.'); break;
      case 'confirm-reset': modal(`<p class="modal-copy">All ${progress.completed.length} captured flags, ${xp()} XP, and saved lab states will be cleared in this browser.</p><div class="modal-actions"><button class="button danger" data-action="apply-reset">Clear all progress</button><button class="button secondary" data-action="close-modal">Keep my voyage</button></div>`, 'Reset your campaign?'); break;
      case 'apply-reset': closeModal(); progress = defaults(); engine = null; mission = null; view = 'campaign'; save(); render(); toast('Campaign reset. Your adventure starts here.'); break;
    }
  });
  document.addEventListener('submit', event => {
    if (event.target.id === 'command-form') { event.preventDefault(); runCommand($('#command-input').value); }
    if (event.target.id === 'flag-form') { event.preventDefault(); captureFlag($('#flag-input').value); }
  });
  document.addEventListener('input', event => { if (event.target.id === 'guide-search') { search = event.target.value; $('#guide-grid').innerHTML = guideCards(); } });
  document.addEventListener('change', event => {
    if (event.target.id === 'motion-setting') { progress.motion = event.target.checked; document.body.classList.toggle('motion-off', !progress.motion); stopAnimation(); drawAnimation(); save(); }
    if (event.target.id === 'progress-file') importProgress(event.target.files[0]);
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && document.body.classList.contains('menu-open')) { document.body.classList.remove('menu-open'); syncMenu(); $('.mobile-menu')?.focus(); } });
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopAnimation(); drawAnimation(); save(); } });
  render();
  if (location.protocol !== 'file:' && 'serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
