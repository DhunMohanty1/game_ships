import * as THREE from 'three';

export class ShipController {
  constructor(ship, input) {
    this.ship = ship;
    this.input = input;

    this.speed = 0;
    this.turnVelocity = 0;

    this.maxForwardSpeed = 26.0; // Increased base speed
    this.maxReverseSpeed = 6.0;

    this.acceleration = 12.0; // Increased base acceleration
    this.reverseAcceleration = 8.0;

    this.rudderStrength = 1.8;
    this.waterDrag = 0.55;
    this.turnDrag = 4.0;
    this.anchorDrag = 8.5;

    this._forward = new THREE.Vector3();
  }

  update(delta) {
    const w = this.input.isKeyPressed('KeyW') || this.input.isKeyPressed('ArrowUp');
    const s = this.input.isKeyPressed('KeyS') || this.input.isKeyPressed('ArrowDown');
    const a = this.input.isKeyPressed('KeyA') || this.input.isKeyPressed('ArrowLeft');
    const d = this.input.isKeyPressed('KeyD') || this.input.isKeyPressed('ArrowRight');

    if (this.input.isKeyPressed('Space')) {
      if (!this.wasSpace) {
        this.ship.userData.anchorDown = !this.ship.userData.anchorDown;
        this.wasSpace = true;
      }
    } else {
      this.wasSpace = false;
    }

    const anchorDown = this.ship.userData.anchorDown;
    const speedMult = this.ship.userData.speedMult || 1.0;
    const turnMult = this.ship.userData.turnSpeedMult || 1.0;

    // Sail management
    if (w) this.ship.userData.sailLevel = Math.min((this.ship.userData.sailLevel || 0) + delta, 1.0);
    if (s) this.ship.userData.sailLevel = Math.max((this.ship.userData.sailLevel || 0) - delta, 0.0);
    
    const sailLevel = this.ship.userData.sailLevel || 0;

    // Wind calculation
    const yaw = this.ship.rotation.y;
    this._forward.set(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
    
    let windPush = 0;
    if (window.gameWind) {
      // Dot product: 1 if wind is directly behind, -1 if directly ahead
      const windDot = this._forward.dot(window.gameWind);
      
      // We can sail if wind is behind us (dot > 0), or slightly against us (dot > -0.3)
      // If wind is against us, windPush drops to 0 or becomes negative.
      windPush = (windDot + 0.3) / 1.3; 
      windPush = Math.max(0.1, windPush); // Minimum speed even against wind for gameplay sake
    } else {
      windPush = 1.0;
    }

    if (anchorDown) {
      this.speed *= Math.exp(-this.anchorDrag * delta);
      this.turnVelocity *= Math.exp(-(this.turnDrag + 2.5) * delta);
    } else {
      // Acceleration is driven by sails and wind
      const targetSpeed = this.maxForwardSpeed * speedMult * sailLevel * windPush;
      
      if (this.speed < targetSpeed) {
        this.speed += (this.acceleration * speedMult) * delta;
      } else if (this.speed > targetSpeed) {
        this.speed -= (this.reverseAcceleration * speedMult) * delta;
      }

      this.speed *= Math.exp(-this.waterDrag * delta);
      this.turnVelocity *= Math.exp(-this.turnDrag * delta);
    }

    this.speed = THREE.MathUtils.clamp(
      this.speed,
      -this.maxReverseSpeed * speedMult,
      this.maxForwardSpeed * speedMult
    );

    const steerInput = (a ? 1 : 0) - (d ? 1 : 0);
    const speedFactor = THREE.MathUtils.clamp(
      Math.abs(this.speed) / (this.maxForwardSpeed * speedMult),
      0.12,
      1.0
    );

    const reverseTurn = this.speed >= 0 ? 1 : -1;
    this.turnVelocity += steerInput * (this.rudderStrength * turnMult) * speedFactor * delta * reverseTurn;

    this.ship.rotation.y += this.turnVelocity;

    const currentYaw = this.ship.rotation.y;
    this._forward.set(Math.sin(currentYaw), 0, Math.cos(currentYaw));

    this.ship.position.addScaledVector(this._forward, this.speed * delta);

    // Update sail visual rotation based on wind
    if (window.gameWind && this.ship.userData.sails) {
      // Find angle between ship and wind
      const shipForward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.ship.quaternion).normalize();
      const windCross = new THREE.Vector3().crossVectors(shipForward, window.gameWind).y;
      
      // Rotate sails to catch wind
      const targetSailRotation = windCross * Math.PI / 4; 
      
      this.ship.userData.sails.forEach(sail => {
        if (sail.geometry.type === 'PlaneGeometry' || sail.geometry.type === 'CylinderGeometry') {
          // Adjust sail scale (Y axis for PlaneGeometry) to simulate raising/lowering
          if (sail.geometry.type === 'PlaneGeometry') {
            sail.scale.y = Math.max(0.01, sailLevel);
          }
          
          // Smoothly rotate the sail group or boom
          sail.rotation.y = THREE.MathUtils.lerp(sail.rotation.y, targetSailRotation, delta * 2);
        }
      });
    }

    // tiny extra dampening when no input is present
    if (!w && !s && !anchorDown) {
      this.speed *= Math.exp(-0.12 * delta);
    }
  }
}