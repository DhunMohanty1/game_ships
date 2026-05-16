import * as THREE from 'three';
import { Input } from './Input.js';
import { CameraController } from './CameraController.js';
import { Ocean } from '../ocean/Ocean.js';
import { createShip } from '../ship/Ship.js';
import { ShipController } from '../ship/ShipController.js';
import { ShipBuoyancy } from '../ship/ShipBuoyancy.js';
import { createIsland } from '../world/Island.js';
import { createSky } from '../world/Sky.js';

export class GameLoop {
  constructor(ui = {}) {
    this.ui = ui;
    this.input = new Input();
    this.clock = new THREE.Clock();
    this.started = false;
    this.introAngle = 0;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#8fd7ff');
    this.scene.fog = new THREE.Fog('#8fc8e6', 90, 360);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1500
    );
    this.camera.position.set(0, 7, 16);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    document.body.appendChild(this.renderer.domElement);

    this.ambient = new THREE.HemisphereLight(0xdff7ff, 0x36572c, 1.65);
    this.scene.add(this.ambient);

    this.sun = new THREE.DirectionalLight(0xfff4d4, 2.4);
    this.sun.position.set(-18, 42, 18);
    this.scene.add(this.sun);

    const sky = createSky();
    this.skyMesh = sky.mesh;
    this.skyUniforms = sky.uniforms;
    this.scene.add(this.skyMesh);

    this.ocean = new Ocean();
    this.scene.add(this.ocean.group);

    this.island = createIsland();
    this.island.position.set(45, 0, 18);
    this.scene.add(this.island);

    this.ship = createShip();
    this.ship.position.set(0, 1.0, -18);
    this.scene.add(this.ship);

    this.shipController = new ShipController(this.ship, this.input);
    this.shipBuoyancy = new ShipBuoyancy(this.ship);
    this.cameraController = new CameraController(this.camera, this.ship);

    window.addEventListener('resize', () => this.onResize());

    this.setUi('Sea of Tides', 'Press W to begin sailing');
  }

  setUi(title, hint) {
    if (this.ui.title) this.ui.title.textContent = title;
    if (this.ui.hint) this.ui.hint.textContent = hint;
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  start() {
    this.clock.start();
    requestAnimationFrame(this.animate);
  }

  animate = () => {
    const delta = Math.min(this.clock.getDelta(), 0.033);
    const time = this.clock.elapsedTime;

    // Keep the ocean centered around the ship every frame.
    this.ocean.update(time, this.ship.position);

    if (!this.started) {
      if (
        this.input.isDown('KeyW') ||
        this.input.isDown('ArrowUp') ||
        this.input.wasPressed('Space')
      ) {
        this.started = true;
        if (this.ui.root) this.ui.root.style.opacity = '0.35';
        this.setUi('Sea of Tides', 'WASD to sail • Space = anchor');
      }

      // Intro camera orbit
      this.introAngle += delta * 0.35;
      const r = 18;
      this.camera.position.set(
        this.ship.position.x + Math.cos(this.introAngle) * r,
        this.ship.position.y + 7.0,
        this.ship.position.z + Math.sin(this.introAngle) * r
      );
      this.camera.lookAt(
        this.ship.position.x,
        this.ship.position.y + 1.2,
        this.ship.position.z
      );
    } else {
      this.shipController.update(delta);
      this.shipBuoyancy.update(time, delta);
      this.cameraController.update(delta);
    }

    this.skyUniforms.uSunDirection.value.copy(this.sun.position).normalize();

    this.renderer.render(this.scene, this.camera);
    this.input.endFrame();

    requestAnimationFrame(this.animate);
  };
}