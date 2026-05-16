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
    this.maxCooldown = this.ship.userData.reloadTime || 1.5; // dynamically read from ship
  }

  update(delta, time) {
    if (this.cooldown > 0) {
      this.cooldown -= delta;
    }

    if ((this.input.isKeyPressed('ControlLeft') || this.input.consumeClick()) && this.cooldown <= 0) {
      if (this.input.isPointerLocked) {
        this.fire();
      }
    }
  }

  fire() {
    if (!this.ship.userData.cannons) return;
    this.cooldown = this.maxCooldown;

    // Raycast from camera center
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.cameraController.camera);
    
    // We aim exactly at where the ray hits the ocean
    let targetPos = new THREE.Vector3();
    if (raycaster.ray.direction.y < 0) {
      const distance = -raycaster.ray.origin.y / raycaster.ray.direction.y;
      targetPos.copy(raycaster.ray.origin).add(raycaster.ray.direction.multiplyScalar(distance));
    } else {
      targetPos.copy(raycaster.ray.origin).add(raycaster.ray.direction.multiplyScalar(1000));
    }
    
    // Determine which side to fire based on the target position relative to the ship
    const shipForward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.ship.quaternion).normalize();
    const shipRight = new THREE.Vector3(1, 0, 0).applyQuaternion(this.ship.quaternion).normalize();
    const toTarget = new THREE.Vector3().subVectors(targetPos, this.ship.position).normalize();
    
    const dotRight = toTarget.dot(shipRight);
    const firingSide = dotRight > 0 ? 'right' : 'left';

    // Fire ALL cannons on the firing side
    let cannonsFired = 0;
    this.ship.userData.cannons.forEach(cannon => {
      if (cannon.side === firingSide) {
        const firePos = cannon.mesh.getWorldPosition(new THREE.Vector3());
        
        // Add slight inaccuracy per cannon
        const shootDir = new THREE.Vector3().subVectors(targetPos, firePos).normalize();
        shootDir.x += (Math.random() - 0.5) * 0.05;
        shootDir.z += (Math.random() - 0.5) * 0.05;
        
        const dist = firePos.distanceTo(targetPos);
        shootDir.y += Math.min(0.2, dist * 0.003); 
        shootDir.normalize();

        this.projectileSystem.spawnProjectile(firePos, shootDir, this.ship.name);
        this.projectileSystem.spawnSmoke(firePos);
        cannonsFired++;
      }
    });

    if (cannonsFired > 0) {
      // Notify network (broadside fire)
      if (this.networkManager && this.networkManager.isHost !== null) {
        this.networkManager.sendFire(this.ship.position, toTarget, firingSide);
      }

      // Add simple camera shake
      const event = new CustomEvent('cameraShake', { detail: { intensity: 0.8 } });
      window.dispatchEvent(event);
    }
  }
}
