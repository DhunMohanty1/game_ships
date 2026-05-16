import * as THREE from 'three';

export class CannonSystem {
  constructor(ship, scene, input, projectileSystem, networkManager, cameraController) {
    this.ship = ship;
    this.scene = scene;
    this.input = input;
    this.projectileSystem = projectileSystem;
    this.networkManager = networkManager;
    this.cameraController = cameraController;
    
    this.cooldown = 0;
    this.maxCooldown = 1.5; // seconds
  }

  update(delta, time) {
    if (this.cooldown > 0) {
      this.cooldown -= delta;
    }

    if ((this.input.isDown('ControlLeft') || this.input.wasPressed('Click')) && this.cooldown <= 0) {
      if (this.input.isPointerLocked) {
        this.fire();
      }
    }
  }

  fire() {
    if (!this.ship.userData.cannons) return;
    this.cooldown = this.maxCooldown;

    // Raycast from mouse position
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(this.input.mousePos.x, this.input.mousePos.y), this.cameraController.camera);
    
    // We aim exactly at where the ray hits the ocean, or infinitely far.
    // Ocean is at Y=0
    let targetPos = new THREE.Vector3();
    if (raycaster.ray.direction.y < 0) {
      const distance = -raycaster.ray.origin.y / raycaster.ray.direction.y;
      targetPos.copy(raycaster.ray.origin).add(raycaster.ray.direction.multiplyScalar(distance));
    } else {
      targetPos.copy(raycaster.ray.origin).add(raycaster.ray.direction.multiplyScalar(1000));
    }
    
    const firePos = this.ship.position.clone();
    firePos.y += 4.0; // Fire from upper deck
    
    // Calculate direction to target
    const shootDir = new THREE.Vector3().subVectors(targetPos, firePos).normalize();
    // Add slight upward arc depending on distance to target
    const dist = firePos.distanceTo(targetPos);
    shootDir.y += Math.min(0.2, dist * 0.003); 
    shootDir.normalize();

    this.projectileSystem.spawnProjectile(firePos, shootDir, this.ship.name);
    this.projectileSystem.spawnSmoke(firePos);

    // Notify network
    if (this.networkManager && this.networkManager.isHost !== null) {
      this.networkManager.sendFire(firePos, shootDir, 'center');
    }

    // Add simple camera shake
    const event = new CustomEvent('cameraShake', { detail: { intensity: 0.5 } });
    window.dispatchEvent(event);
  }
}
