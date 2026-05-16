import * as THREE from 'three';

export class ShipController {
  constructor(ship, input) {
    this.ship = ship;
    this.input = input;

    this.speed = 0;
    this.turnVelocity = 0;

    this.maxForwardSpeed = 16.0;
    this.maxReverseSpeed = 4.5;

    this.acceleration = 9.0;
    this.reverseAcceleration = 6.0;

    this.rudderStrength = 1.8;
    this.waterDrag = 0.55;
    this.turnDrag = 4.0;
    this.anchorDrag = 8.5;

    this._forward = new THREE.Vector3();
  }

  update(delta) {
    const w = this.input.isDown('KeyW') || this.input.isDown('ArrowUp');
    const s = this.input.isDown('KeyS') || this.input.isDown('ArrowDown');
    const a = this.input.isDown('KeyA') || this.input.isDown('ArrowLeft');
    const d = this.input.isDown('KeyD') || this.input.isDown('ArrowRight');

    if (this.input.wasPressed('Space')) {
      this.ship.userData.anchorDown = !this.ship.userData.anchorDown;
    }

    const anchorDown = this.ship.userData.anchorDown;

    if (anchorDown) {
      this.speed *= Math.exp(-this.anchorDrag * delta);
      this.turnVelocity *= Math.exp(-(this.turnDrag + 2.5) * delta);
    } else {
      if (w) {
        this.speed += this.acceleration * delta;
      }

      if (s) {
        this.speed -= this.reverseAcceleration * delta;
      }

      this.speed *= Math.exp(-this.waterDrag * delta);
      this.turnVelocity *= Math.exp(-this.turnDrag * delta);
    }

    this.speed = THREE.MathUtils.clamp(
      this.speed,
      -this.maxReverseSpeed,
      this.maxForwardSpeed
    );

    const steerInput = (a ? 1 : 0) - (d ? 1 : 0);
    const speedFactor = THREE.MathUtils.clamp(
      Math.abs(this.speed) / this.maxForwardSpeed,
      0.12,
      1.0
    );

    const reverseTurn = this.speed >= 0 ? 1 : -1;
    this.turnVelocity += steerInput * this.rudderStrength * speedFactor * delta * reverseTurn;

    this.ship.rotation.y += this.turnVelocity;

    const yaw = this.ship.rotation.y;
    this._forward.set(Math.sin(yaw), 0, Math.cos(yaw));

    this.ship.position.addScaledVector(this._forward, this.speed * delta);

    // tiny extra dampening when no input is present
    if (!w && !s && !anchorDown) {
      this.speed *= Math.exp(-0.12 * delta);
    }
  }
}