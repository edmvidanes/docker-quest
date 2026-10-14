(function (root) {
  'use strict';
  const zones = [
    { id: 'harbor', name: 'The harbor', subtitle: 'Every great voyage starts here.', topic: 'Docker foundations', color: 'lime', icon: 'anchor' },
    { id: 'dockyard', name: 'The dockyard', subtitle: 'Take the controls. Find the clues.', topic: 'Container operations', color: 'blue', icon: 'box' },
    { id: 'workshop', name: 'The workshop', subtitle: 'Give your containers a home.', topic: 'Ports, storage & images', color: 'peach', icon: 'wrench' },
    { id: 'open-sea', name: 'The open sea', subtitle: 'Connect the fleet. Ship together.', topic: 'Networks & Compose', color: 'purple', icon: 'ship' }
  ];
  const missions = [
    {
      id: 1, zone: 'harbor', title: 'Hello, container.', subtitle: 'Your first message from the other side.', minutes: 4, xp: 100, topic: 'run', icon: 'terminal',
      brief: 'Welcome aboard, cadet. Before we launch the fleet, make sure the engine is awake. Inspect the Docker version, then run the hello-world image to send your first signal.',
      objectives: [{ text: 'Inspect your Docker installation', test: 'version' }, { text: 'Run the hello-world container', test: 'hello' }],
      hints: ['The version command tells you about the client and the engine.', 'Use docker run followed by an image name.', 'docker version\ndocker run hello-world'],
      solution: ['docker version', 'docker run hello-world'], flag: 'DOCK{first_contact}',
      lesson: 'An image is a read-only blueprint. A container is a running (or stopped) instance of that blueprint. Docker downloads a missing image, creates a container, and runs its main process. When that process finishes, the container stops.',
      frames: ['You send a command to the Docker engine.', 'The engine finds the image locally, or pulls it from a registry.', 'It creates an isolated container from the image.', 'The process prints its message and exits. The stopped container still exists.']
    },
    {
      id: 2, zone: 'harbor', title: 'Blueprints, not boxes', subtitle: 'Collect an image without running it.', minutes: 4, xp: 100, topic: 'image', icon: 'layers',
      brief: 'The harbor needs an Alpine blueprint. Pull alpine:3.20, then inspect your image inventory. A downloaded image does not start a container.',
      objectives: [{ text: 'Pull alpine:3.20', test: 'alpineImage' }, { text: 'List your local images', test: 'imagesListed' }],
      hints: ['Image tags pick a specific version. Write them after a colon.', 'Pull downloads an image; images lists your local inventory.', 'docker pull alpine:3.20\ndocker images'],
      solution: ['docker pull alpine:3.20', 'docker images'], flag: 'DOCK{blueprint_collected}',
      lesson: 'Images consist of cached, read-only filesystem layers and configuration. A tag such as 3.20 is a human-readable reference; tags can change. Pulling an image stores it locally. Creating a container adds its own writable layer.',
      frames: ['The registry holds the tagged Alpine image.', 'Docker downloads the required image layers.', 'The image is now cached on your machine.', 'The blueprint is ready. No container has been created.']
    },
    {
      id: 3, zone: 'harbor', title: 'Keep the light on', subtitle: 'Start a service in the background.', minutes: 5, xp: 125, topic: 'run', icon: 'play',
      brief: 'Start nginx:alpine as a background container named lighthouse. Then list your running containers to confirm the service is alive.',
      objectives: [{ text: 'Run nginx:alpine detached, named lighthouse', test: 'lighthouse' }, { text: 'List the running containers', test: 'psListed' }],
      hints: ['Detached mode lets the container run while your terminal is free.', 'Use -d for detached mode and --name for a memorable name.', 'docker run -d --name lighthouse nginx:alpine\ndocker ps'],
      solution: ['docker run -d --name lighthouse nginx:alpine', 'docker ps'], flag: 'DOCK{lighthouse_online}',
      lesson: 'The -d flag detaches your terminal from the container. The container keeps running while its main process is alive. A name makes it easier to refer to that container. docker ps shows running containers; docker ps -a includes stopped ones.',
      frames: ['Choose nginx:alpine as the service blueprint.', 'Create a container named lighthouse.', 'The Nginx process keeps the container running.', 'Detached mode returns control to your terminal.']
    },
    {
      id: 4, zone: 'harbor', title: 'The missing cargo', subtitle: 'Find what the running list hides.', minutes: 4, xp: 125, topic: 'lifecycle', icon: 'search', seed: 'stopped',
      brief: 'A cargo container has disappeared from the running list. List all containers and inspect cargo to discover its exit state.',
      objectives: [{ text: 'Include stopped containers in your list', test: 'allListed' }, { text: 'Inspect the cargo container', test: 'cargoInspected' }],
      hints: ['A stopped container still has a filesystem and metadata.', 'The -a option includes stopped containers. Inspect gives detailed JSON.', 'docker ps -a\ndocker inspect cargo'],
      solution: ['docker ps -a', 'docker inspect cargo'], flag: 'DOCK{nothing_is_lost}',
      lesson: 'Stopped does not mean deleted. The container keeps its configuration and writable layer until you remove it. Inspect reveals its state, image, mounts, environment, and networking. A zero exit code usually means successful completion.',
      frames: ['The cargo process has finished.', 'docker ps only shows running containers.', 'docker ps -a reveals the stopped cargo.', 'Inspect its state: exited, with exit code 0.']
    },
    {
      id: 5, zone: 'dockyard', title: 'A controlled landing', subtitle: 'Stop it. Start it. Keep its identity.', minutes: 5, xp: 150, topic: 'lifecycle', icon: 'refresh', seed: 'lighthouse',
      brief: 'The lighthouse needs maintenance. Stop it gracefully, then start the same container again. Leave it running for the next crew.',
      objectives: [{ text: 'Stop lighthouse', test: 'stoppedLighthouse' }, { text: 'Restart the same lighthouse container', test: 'restartedLighthouse' }],
      hints: ['Stop and start act on an existing container, so use its name.', 'docker run creates a new container. docker start reuses one.', 'docker stop lighthouse\ndocker start lighthouse'],
      solution: ['docker stop lighthouse', 'docker start lighthouse'], flag: 'DOCK{back_in_service}',
      lesson: 'docker stop sends the configured stop signal, normally SIGTERM, and later SIGKILL if the process does not exit within the timeout. docker start restarts the existing container, preserving its writable layer and settings.',
      frames: ['The service is running in lighthouse.', 'Stop asks the main process to shut down.', 'The container stops, but its writable layer remains.', 'Start runs the same container again. Its identity is unchanged.']
    },
    {
      id: 6, zone: 'dockyard', title: 'Read the signals', subtitle: 'The logs have a story to tell.', minutes: 4, xp: 150, topic: 'logs', icon: 'file', seed: 'beacon',
      brief: 'The beacon service is reporting a warning. Read its logs, then inspect its configuration. You do not need to enter the container to investigate.',
      objectives: [{ text: 'Read beacon logs', test: 'beaconLogs' }, { text: 'Inspect beacon configuration', test: 'beaconInspected' }],
      hints: ['Logs capture the stdout and stderr of a container process.', 'Both logs and inspect accept the container name.', 'docker logs beacon\ndocker inspect beacon'],
      solution: ['docker logs beacon', 'docker inspect beacon'], flag: 'DOCK{signal_received}',
      lesson: 'docker logs reads the output captured from a container’s standard output and error streams. Applications should send useful logs there. docker inspect complements those logs with configuration and state.',
      frames: ['The application writes a message to stdout.', 'Docker captures the process output.', 'docker logs displays the captured messages.', 'Inspect adds context such as environment and container state.']
    },
    {
      id: 7, zone: 'dockyard', title: 'Inside the container', subtitle: 'A little filesystem archaeology.', minutes: 6, xp: 175, topic: 'exec', icon: 'terminal', seed: 'vault',
      brief: 'A flag is hidden inside the running vault container. Execute ls / inside vault, then read /secret/flag.txt. The flag in that file is your mission token.',
      objectives: [{ text: 'Explore the vault filesystem with exec', test: 'vaultListed' }, { text: 'Read /secret/flag.txt inside vault', test: 'vaultRead' }],
      hints: ['Exec runs an extra process inside a running container.', 'Use docker exec vault followed by ls or cat.', 'docker exec vault ls /\ndocker exec vault cat /secret/flag.txt'],
      solution: ['docker exec vault ls /', 'docker exec vault cat /secret/flag.txt'], flag: 'DOCK{inside_the_box}',
      lesson: 'docker exec runs an additional process in an existing running container. Its paths refer to the container filesystem. Containers have their own filesystem view; a path inside one is not automatically a path on your host.',
      frames: ['Your host sends an exec request to the engine.', 'Docker starts a second process inside vault.', 'That process reads the container filesystem.', 'The file content returns to your terminal.']
    },
    {
      id: 8, zone: 'dockyard', title: 'Leave no trace', subtitle: 'Clean up containers, keep the blueprint.', minutes: 5, xp: 175, topic: 'lifecycle', icon: 'trash', seed: 'cleanup',
      brief: 'Clear the abandoned cargo container and the running temp container. Stop temp before removing it. Keep the Alpine image so the next crew can use it.',
      objectives: [{ text: 'Remove the stopped cargo container', test: 'cargoRemoved' }, { text: 'Stop and remove temp', test: 'tempRemoved' }, { text: 'Keep the Alpine image', test: 'keepAlpine' }],
      hints: ['Removing a container is different from removing its image.', 'docker rm normally requires the container to be stopped.', 'docker rm cargo\ndocker stop temp\ndocker rm temp'],
      solution: ['docker rm cargo', 'docker stop temp', 'docker rm temp'], flag: 'DOCK{tidy_dockyard}',
      lesson: 'docker rm deletes the container, including its writable layer. It does not delete its image or named volumes. docker rmi removes an image. Force removal can interrupt running processes, so stop deliberately when possible.',
      frames: ['The stopped cargo is ready to be removed.', 'Stop temp so its process can exit.', 'Remove both containers and their writable layers.', 'The shared image remains ready for reuse.']
    },
    {
      id: 9, zone: 'workshop', title: 'Open a port', subtitle: 'Build a bridge to the browser.', minutes: 6, xp: 200, topic: 'ports', icon: 'globe',
      brief: 'Bring up nginx:alpine as web, detached, and publish host port 8080 to container port 80. Use curl http://localhost:8080 to check the route.',
      objectives: [{ text: 'Run web with a mapping from 8080 to 80', test: 'webPort' }, { text: 'Reach web through localhost:8080', test: 'webReached' }],
      hints: ['The syntax is -p HOST_PORT:CONTAINER_PORT.', 'Nginx listens on port 80 inside its container.', 'docker run -d --name web -p 8080:80 nginx:alpine\ncurl http://localhost:8080'],
      solution: ['docker run -d --name web -p 8080:80 nginx:alpine', 'curl http://localhost:8080'], flag: 'DOCK{a_window_to_the_web}',
      lesson: 'A published port forwards traffic arriving on the host to a container port. In 8080:80, the left side belongs to your host and the right side belongs to the container. EXPOSE documents a port; it does not publish it.',
      frames: ['Your browser requests localhost:8080.', 'The host receives the request on port 8080.', 'Docker forwards it to container port 80.', 'Nginx responds through the same mapping.']
    },
    {
      id: 10, zone: 'workshop', title: 'Cargo that survives', subtitle: 'Containers come and go. Data stays.', minutes: 7, xp: 225, topic: 'volume', icon: 'database', seed: 'volume',
      brief: 'The writer container has stored a flag in a named volume called cargo-data. Remove writer, then mount cargo-data at /data in a fresh Alpine container named reader and read /data/flag.txt.',
      objectives: [{ text: 'Remove writer, keeping its named volume', test: 'writerRemoved' }, { text: 'Read the saved flag using a fresh reader container', test: 'volumeRead' }],
      hints: ['Named volumes exist independently of a container.', 'Mount a named volume with -v cargo-data:/data.', 'docker rm writer\ndocker run --name reader -v cargo-data:/data alpine:3.20 cat /data/flag.txt'],
      solution: ['docker rm writer', 'docker run --name reader -v cargo-data:/data alpine:3.20 cat /data/flag.txt'], flag: 'DOCK{data_outlives_containers}',
      lesson: 'A named volume is storage managed by Docker outside the container’s writable layer. Removing a container does not remove the named volume. Mount the volume in another container to access the same data.',
      frames: ['Writer saves the flag in the cargo-data volume.', 'Remove writer and its private writable layer.', 'The named volume stays on the host.', 'Mount the volume in reader. The saved flag is still there.']
    },
    {
      id: 11, zone: 'workshop', title: 'Write the blueprint', subtitle: 'Your first Dockerfile, one layer at a time.', minutes: 8, xp: 225, topic: 'build', icon: 'layers', seed: 'build',
      brief: 'Inspect the local Dockerfile with cat Dockerfile. Build this directory as an image tagged dock-app:v1, then run your new image to see its message.',
      objectives: [{ text: 'Read the Dockerfile', test: 'dockerfileRead' }, { text: 'Build dock-app:v1 using the current directory', test: 'appBuilt' }, { text: 'Run dock-app:v1', test: 'appRan' }],
      hints: ['The -t flag names and tags the image you build.', 'The final dot is the build context: the current directory.', 'cat Dockerfile\ndocker build -t dock-app:v1 .\ndocker run dock-app:v1'],
      solution: ['cat Dockerfile', 'docker build -t dock-app:v1 .', 'docker run dock-app:v1'], flag: 'DOCK{built_from_scratch}',
      lesson: 'FROM selects the base image. COPY adds files from the build context. WORKDIR sets the working directory. RUN executes at build time, while CMD supplies the default process at container start. The final dot passes the current directory as the build context.',
      frames: ['FROM starts with the Alpine base layers.', 'WORKDIR sets /app. COPY adds the message file.', 'Docker records CMD as the default startup command.', 'Build produces dock-app:v1. Run creates a container from it.']
    },
    {
      id: 12, zone: 'workshop', title: 'Configuration, delivered', subtitle: 'One image. Different environments.', minutes: 6, xp: 250, topic: 'env', icon: 'sliders',
      brief: 'Run a detached Alpine container named signal with QUEST_MODE=production in its environment. Keep it alive with sleep 3600, then use exec signal printenv QUEST_MODE to confirm the value.',
      objectives: [{ text: 'Run signal with QUEST_MODE=production', test: 'signalEnv' }, { text: 'Read QUEST_MODE inside signal', test: 'envRead' }],
      hints: ['Use -e KEY=value to supply an environment variable.', 'Alpine needs a long-running command to stay alive in this simulator.', 'docker run -d --name signal -e QUEST_MODE=production alpine:3.20 sleep 3600\ndocker exec signal printenv QUEST_MODE'],
      solution: ['docker run -d --name signal -e QUEST_MODE=production alpine:3.20 sleep 3600', 'docker exec signal printenv QUEST_MODE'], flag: 'DOCK{configured_for_launch}',
      lesson: 'Environment variables configure a container without rebuilding its image. The -e option sets a value for the container’s process environment. Environment variables are visible through inspection, so do not treat them as secure secret storage.',
      frames: ['The image stays the same across environments.', 'Pass QUEST_MODE=production when creating signal.', 'The process receives that value in its environment.', 'Exec starts printenv, which reads the configured value.']
    },
    {
      id: 13, zone: 'open-sea', title: 'A private channel', subtitle: 'Make room for your fleet.', minutes: 6, xp: 250, topic: 'network', icon: 'network',
      brief: 'Create a user-defined bridge network called fleet. Run a detached nginx:alpine container named api on fleet, then inspect the network to see its members.',
      objectives: [{ text: 'Create the fleet network', test: 'fleetCreated' }, { text: 'Run api attached to fleet', test: 'apiNetwork' }, { text: 'Inspect fleet membership', test: 'fleetInspected' }],
      hints: ['docker network create makes a user-defined bridge by default.', 'Use --network fleet when starting the container.', 'docker network create fleet\ndocker run -d --name api --network fleet nginx:alpine\ndocker network inspect fleet'],
      solution: ['docker network create fleet', 'docker run -d --name api --network fleet nginx:alpine', 'docker network inspect fleet'], flag: 'DOCK{fleet_assembled}',
      lesson: 'A user-defined bridge network connects containers on the same Docker host. It provides automatic name-based DNS among its containers. Containers can communicate using their internal ports without publishing those ports on the host.',
      frames: ['Create fleet as a user-defined bridge network.', 'Attach api to that network.', 'Docker assigns api a network address.', 'Members can resolve one another by container name.']
    },
    {
      id: 14, zone: 'open-sea', title: 'Talk by name', subtitle: 'Follow the packet across the fleet.', minutes: 7, xp: 275, topic: 'network', icon: 'route', seed: 'network',
      brief: 'The api service is already on fleet. Start an Alpine scout on the same network, keep it alive, and use docker exec scout wget -qO- http://api:80 to reach the service by name.',
      objectives: [{ text: 'Run scout on fleet', test: 'scoutNetwork' }, { text: 'Reach api by name from inside scout', test: 'dnsReached' }],
      hints: ['The service name is a DNS name inside a user-defined network.', 'Use --network fleet. Internal traffic goes to api:80.', 'docker run -d --name scout --network fleet alpine:3.20 sleep 3600\ndocker exec scout wget -qO- http://api:80'],
      solution: ['docker run -d --name scout --network fleet alpine:3.20 sleep 3600', 'docker exec scout wget -qO- http://api:80'], flag: 'DOCK{names_over_numbers}',
      lesson: 'On a user-defined network, Docker DNS resolves api to its container address. Containers communicate directly on the service’s internal port. localhost inside scout refers to scout itself, not the host or api.',
      frames: ['Scout requests http://api:80.', 'Docker DNS resolves api on the fleet network.', 'The packet travels to api’s internal port 80.', 'The response returns to scout. No host port is needed.']
    },
    {
      id: 15, zone: 'open-sea', title: 'The fleet manifest', subtitle: 'Launch a stack with Compose.', minutes: 8, xp: 300, topic: 'compose', icon: 'file', seed: 'compose',
      brief: 'Read compose.yaml to understand the web and cache services. Validate it with docker compose config, start the stack detached, and inspect its services with docker compose ps.',
      objectives: [{ text: 'Read and validate compose.yaml', test: 'composeRead' }, { text: 'Start the Compose stack detached', test: 'composeUp' }, { text: 'List the Compose services', test: 'composeListed' }],
      hints: ['Compose describes a collection of services declaratively.', 'Use docker compose up -d to bring the services up.', 'cat compose.yaml\ndocker compose config\ndocker compose up -d\ndocker compose ps'],
      solution: ['cat compose.yaml', 'docker compose config', 'docker compose up -d', 'docker compose ps'], flag: 'DOCK{one_manifest_one_fleet}',
      lesson: 'Compose defines services, networks, and volumes in YAML. docker compose config validates and resolves that configuration. up creates or updates the services; down removes the stack’s containers and networks. Named volumes remain unless you explicitly remove them.',
      frames: ['The YAML manifest defines web and cache.', 'Compose creates a shared default network.', 'Each service starts in its own container.', 'One Compose command manages the whole stack.']
    },
    {
      id: 16, zone: 'open-sea', title: 'Captain’s challenge', subtitle: 'Build it. Connect it. Prove it.', minutes: 12, xp: 500, topic: 'boss', icon: 'flag', seed: 'boss',
      brief: 'Your final mission: build dock-app:v1, create fleet, and launch a detached nginx:alpine service named flagship with host port 8080 mapped to 80, on fleet, with cargo-data mounted at /data. Verify the HTTP response and inspect flagship. The crew is counting on you.',
      objectives: [{ text: 'Build dock-app:v1', test: 'appBuilt' }, { text: 'Create fleet and launch flagship on it', test: 'flagshipNetwork' }, { text: 'Publish 8080:80 and mount cargo-data at /data', test: 'flagshipSetup' }, { text: 'Reach flagship and inspect it', test: 'flagshipVerified' }],
      hints: ['Break the challenge into build, network, run, and verification.', 'Combine --name, --network, -p and -v in one run command.', 'docker build -t dock-app:v1 .\ndocker network create fleet\ndocker run -d --name flagship --network fleet -p 8080:80 -v cargo-data:/data nginx:alpine\ncurl http://localhost:8080\ndocker inspect flagship'],
      solution: ['docker build -t dock-app:v1 .', 'docker network create fleet', 'docker run -d --name flagship --network fleet -p 8080:80 -v cargo-data:/data nginx:alpine', 'curl http://localhost:8080', 'docker inspect flagship'], flag: 'DOCK{ready_to_ship}',
      lesson: 'You have combined images, container lifecycle, published ports, persistent storage, and networking. An image build and a service launch are separate steps. These same Docker commands transfer to a real installation; the simulator helps you rehearse their relationships.',
      frames: ['Build the application image from its Dockerfile.', 'Create fleet and attach your flagship service.', 'Mount persistent cargo-data and publish port 8080.', 'Verify the service from the host. Your fleet is ready to ship.']
    }
  ];
  const guide = [
    ['Your engine', 'Inspect the installation and learn the difference between the client and the engine.', [['docker version', 'Client and server versions'], ['docker info', 'Engine overview']]],
    ['Images', 'Images are reusable, read-only blueprints. A tag follows the colon.', [['docker pull alpine:3.20', 'Download an image'], ['docker images', 'List local images'], ['docker build -t dock-app:v1 .', 'Build using the current directory'], ['docker rmi alpine:3.20', 'Remove an unused image']]],
    ['Containers', 'A container is an instance of an image, with its own writable layer and processes.', [['docker run -d --name web nginx:alpine', 'Create and start in the background'], ['docker ps', 'List running containers'], ['docker ps -a', 'Include stopped containers'], ['docker stop web', 'Stop gracefully'], ['docker start web', 'Start the same container'], ['docker rm web', 'Remove a stopped container']]],
    ['Investigating', 'Observe a container from the host, or run a process inside it.', [['docker logs web', 'Read captured stdout and stderr'], ['docker inspect web', 'Inspect state and configuration'], ['docker exec web ls /', 'Run a command inside a container'], ['docker exec web cat /etc/os-release', 'Read a container file']]],
    ['Ports & configuration', 'Host and container ports are separate. The mapping goes from left to right.', [['docker run -d -p 8080:80 nginx:alpine', 'Publish host 8080 → container 80'], ['docker run -d -e MODE=prod alpine:3.20 sleep 3600', 'Set a process environment value'], ['curl http://localhost:8080', 'Send an HTTP request from the host']]],
    ['Persistent storage', 'Named volumes survive container removal. A mount makes their data visible at a container path.', [['docker volume create cargo-data', 'Create a named volume'], ['docker volume ls', 'List volumes'], ['docker run -v cargo-data:/data alpine:3.20 ls /data', 'Mount and inspect a volume'], ['docker volume inspect cargo-data', 'Inspect volume metadata']]],
    ['Networks', 'Containers on a user-defined bridge can talk to each other by name.', [['docker network create fleet', 'Create a bridge network'], ['docker run -d --network fleet --name api nginx:alpine', 'Attach a service to fleet'], ['docker network ls', 'List networks'], ['docker network inspect fleet', 'See network members'], ['docker network connect fleet web', 'Connect an existing container']]],
    ['Compose', 'Describe a stack in compose.yaml. Use these commands in the directory containing the file.', [['docker compose config', 'Validate and display configuration'], ['docker compose up -d', 'Create and start the stack'], ['docker compose ps', 'List services'], ['docker compose logs', 'Read service logs'], ['docker compose down', 'Remove stack containers and network']]],
    ['Practice terminal', 'This is a teaching simulator, with a local image registry and simplified processes. It never runs commands on your computer.', [['help', 'List supported commands'], ['claim', 'Reveal the mission flag once objectives are met'], ['ls', 'List the simulated working directory'], ['cat Dockerfile', 'Read the current lab blueprint'], ['clear', 'Clear the terminal display']]]
  ];
  const data = { zones, missions, guide };
  root.DQContent = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(globalThis);
