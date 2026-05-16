import * as THREE from 'three';

export class CameraController {
  constructor(camera, target, input) {
    this.camera = camera;
    this.target = target;
    this.input = input;

    this.distance = 15.5;
    this.heightOffset = 4.5;
    
    // Default angles (looking forward relative to ship)
    this.yaw = Math.PI; 
    this.pitch = 0.15; // slightly looking down
    
    this.shakeIntensity = 0;
    
    window.addEventListener('cameraShake', (e) => {
      this.shakeIntensity = Math.min(this.shakeIntensity + e.detail.intensity, 1.5);
    });
  }

  update(delta) {
    // Update yaw and pitch from mouse movement
    if (this.input.isPointerLocked) {
      this.yaw -= this.input.movementX * 0.003;
      this.pitch -= this.input.movementY * 0.003;
      
      // Clamp pitch so we don't look upside down or go under the water (too much)
      this.pitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 3, this.pitch));
    } else {
      // Very slowly center camera if not locked (optional, we'll skip for now)
    }

    // Calculate desired position based on yaw, pitch, distance
    const r = this.distance * Math.cos(this.pitch);
    const yOffset = this.distance * Math.sin(this.pitch);
    
    // Add ship base rotation so the camera orbits relative to the ship, 
    // or keep it world relative. World relative is better for aiming.
    
    const camX = this.target.position.x + Math.sin(this.yaw) * r;
    const camY = this.target.position.y + this.heightOffset + yOffset;
    const camZ = this.target.position.z + Math.cos(this.yaw) * r;

    // Smooth position (or snap)
    this.camera.position.set(camX, camY, camZ);
    
    // Look at target center
    const lookAtPos = new THREE.Vector3(
      this.target.position.x,
      this.target.position.y + this.heightOffset,
      this.target.position.z
    );
    
    // Apply camera shake
    if (this.shakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.z += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity -= delta * 2.0;
      if (this.shakeIntensity < 0) this.shakeIntensity = 0;
    }

    this.camera.lookAt(lookAtPos);
  }
}