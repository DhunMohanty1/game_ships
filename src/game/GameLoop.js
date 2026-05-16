import * as THREE from 'three';
import { Input } from './Input.js';
import { CameraController } from './CameraController.js';
import { Ocean } from '../ocean/Ocean.js';
import { createShip } from '../ship/Ship.js';
import { ShipController } from '../ship/ShipController.js';
import { ShipBuoyancy } from '../ship/ShipBuoyancy.js';
import { createArena } from '../world/Arena.js';
import { createSky } from '../world/Sky.js';
import { MultiplayerManager } from './MultiplayerManager.js';
import { ProjectileSystem } from './ProjectileSystem.js';
import { CannonSystem } from '../ship/CannonSystem.js';
import { PhysicsSystem } from './PhysicsSystem.js';

export class GameLoop {
  constructor(networkManager) {
    this.networkManager = networkManager;
    this.input = new Input();
    this.clock = new THREE.Clock();
    this.started = false;
    this.isMultiplayer = false;
    this.introAngle = 0;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#44aaff'); 
    this.scene.fog = new THREE.Fog('#44aaff', 40, 150); 

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1500
    );
    this.camera.position.set(0, 35, 18); // default kart position

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    document.body.appendChild(this.renderer.domElement);

    this.ambient = new THREE.HemisphereLight(0xfff0dd, 0x223344, 1.4);
    this.scene.add(this.ambient);

    this.sun = new THREE.DirectionalLight(0xffddaa, 3.5);
    this.sun.position.set(-20, 25, 20);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 150;
    this.sun.shadow.camera.left = -60;
    this.sun.shadow.camera.right = 60;
    this.sun.shadow.camera.top = 60;
    this.sun.shadow.camera.bottom = -60;
    this.sun.shadow.bias = -0.0005;
    this.scene.add(this.sun);

    const sky = createSky();
    this.skyMesh = sky.mesh;
    this.skyUniforms = sky.uniforms;
    this.scene.add(this.skyMesh);

    this.ocean = new Ocean();
    this.scene.add(this.ocean.group);

    this.arena = createArena();
    this.scene.add(this.arena);

    // Get spawn point based on team (red by default for MVP)
    const team = 'red';
    const spawnPos = this.arena.userData.spawnPoints[team];

    this.ship = createShip(team);
    this.ship.position.copy(spawnPos);
    this.ship.rotation.y = team === 'red' ? 0 : Math.PI; // Face the center
    this.scene.add(this.ship);

    this.shipController = new ShipController(this.ship, this.input);
    this.shipBuoyancy = new ShipBuoyancy(this.ship);
    this.cameraController = new CameraController(this.camera, this.ship, this.input);

    this.projectileSystem = new ProjectileSystem(this.scene, this.ocean);
    this.cannonSystem = new CannonSystem(this.ship, this.scene, this.input, this.projectileSystem, this.networkManager, this.cameraController);
    this.multiplayerManager = null;
    
    this.physicsSystem = new PhysicsSystem(this.scene, this.arena, this.projectileSystem, null);

    window.addEventListener('resize', () => this.onResize());

    this.windDirection = new THREE.Vector3(1, 0, 0).normalize();
    // Expose wind to window for easy access
    window.gameWind = this.windDirection;

    this.clock.start();
    requestAnimationFrame(this.animate);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  startGame(isMultiplayer, shipClass = 'galleon') {
    this.started = true;
    this.isMultiplayer = isMultiplayer;

    // Create new ship based on class
    if (this.ship) {
      this.scene.remove(this.ship);
    }
    const team = (isMultiplayer && this.networkManager && this.networkManager.team) ? this.networkManager.team : 'red';
    const spawnPos = this.arena.userData.spawnPoints[team];
    this.ship = createShip(team, shipClass);
    this.ship.position.copy(spawnPos);
    this.ship.rotation.y = team === 'red' ? 0 : Math.PI;
    this.scene.add(this.ship);

    // Re-bind controllers
    this.shipController = new ShipController(this.ship, this.input);
    this.shipBuoyancy = new ShipBuoyancy(this.ship);
    this.cameraController = new CameraController(this.camera, this.ship, this.input);
    this.cannonSystem = new CannonSystem(this.ship, this.scene, this.input, this.projectileSystem, this.networkManager, this.cameraController);

    if (this.physicsSystem) {
       this.physicsSystem.mainShip = this.ship;
    }

    if (isMultiplayer) {
      this.multiplayerManager = new MultiplayerManager(this.scene, this.networkManager);
      this.physicsSystem.multiplayerManager = this.multiplayerManager;
      
      this.networkManager.socket.on('playerFired', (data) => {
        if (this.multiplayerManager.remoteShips[data.id]) {
          this.multiplayerManager.fireRemoteCannons(data.id, data.position, data.direction, data.side, this.projectileSystem);
        }
      });
    }
  }

  animate = () => {
    const delta = Math.min(this.clock.getDelta(), 0.033);
    const time = this.clock.elapsedTime;

    this.ocean.update(time, this.ship.position);

    if (!this.started) {
      this.introAngle += delta * 0.35;
      const r = 24;
      this.camera.position.set(
        this.ship.position.x + Math.cos(this.introAngle) * r,
        this.ship.position.y + 10.0,
        this.ship.position.z + Math.sin(this.introAngle) * r
      );
      this.camera.lookAt(
        this.ship.position.x,
        this.ship.position.y + 3.2,
        this.ship.position.z
      );
      this.shipBuoyancy.update(time, delta); 
    } else {
      this.shipController.update(delta);
      this.shipBuoyancy.update(time, delta);
      this.cameraController.update(delta);
      this.cannonSystem.update(delta, time);
      
      this.physicsSystem.update(delta, this.ship);

      if (this.isMultiplayer && this.multiplayerManager) {
        this.multiplayerManager.update(delta);
        
        if (Math.floor(time * 10) > Math.floor((time - delta) * 10)) {
           this.networkManager.sendMove(this.ship.position, this.ship.rotation, this.ship.userData.shipClass);
        }
      }

      // Visuals: Wake and Foam
      if (this.shipController && Math.abs(this.shipController.speed) > 2.0) {
        if (Math.random() < 0.3) {
          const backOffset = new THREE.Vector3(0, 0, -(this.ship.userData.forwardLength || 5.4)).applyQuaternion(this.ship.quaternion);
          const wakePos = this.ship.position.clone().add(backOffset);
          this.projectileSystem.spawnWake(wakePos, Math.abs(this.shipController.speed) / 10);
        }
        if (this.shipController.speed > 5.0 && Math.random() < 0.2) {
          const frontOffset = new THREE.Vector3(0, 0, (this.ship.userData.forwardLength || 5.4)).applyQuaternion(this.ship.quaternion);
          const foamPos = this.ship.position.clone().add(frontOffset);
          this.projectileSystem.spawnFoam(foamPos);
        }
      }
    }

    this.projectileSystem.update(delta, time);
    this.skyUniforms.uSunDirection.value.copy(this.sun.position).normalize();

    this.renderer.render(this.scene, this.camera);
    this.input.endFrame();

    requestAnimationFrame(this.animate);
  };
}