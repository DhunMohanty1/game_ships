import * as THREE from 'three';
import { sampleOceanHeight } from '../ocean/OceanWaves.js';

export class ShipBuoyancy {
  constructor(ship) {
    this.ship = ship;

    this.front = new THREE.Vector3(0, 0, 5.4);
    this.back = new THREE.Vector3(0, 0, -5.4);
    this.left = new THREE.Vector3(-2.5, 0, 0);
    this.right = new THREE.Vector3(2.5, 0, 0);

    this._worldPoint = new THREE.Vector3();
    this._tmp = new THREE.Vector3();
  }

  sampleHeight(localPoint, time) {
    this._worldPoint.copy(localPoint).applyMatrix4(this.ship.matrixWorld);
    return sampleOceanHeight(this._worldPoint.x, this._worldPoint.z, time);
  }

  update(time, delta) {
    this.ship.updateMatrixWorld(true);

    const frontH = this.sampleHeight(this.front, time);
    const backH = this.sampleHeight(this.back, time);
    const leftH = this.sampleHeight(this.left, time);
    const rightH = this.sampleHeight(this.right, time);

    const avgHeight = (frontH + backH + leftH + rightH) * 0.25;
    const targetY = avgHeight + this.ship.userData.waterlineOffset;

    const pitchTarget = Math.atan2(
      frontH - backH,
      this.ship.userData.forwardLength * 2.0
    );

    const rollTarget = Math.atan2(
      rightH - leftH,
      this.ship.userData.sideWidth * 2.0
    );

    const yLerp = 1.0 - Math.exp(-3.5 * delta);
    const rotLerp = 1.0 - Math.exp(-5.0 * delta);

    this.ship.position.y = THREE.MathUtils.lerp(
      this.ship.position.y,
      targetY,
      yLerp
    );

    this.ship.rotation.x = THREE.MathUtils.lerp(
      this.ship.rotation.x,
      -pitchTarget,
      rotLerp
    );

    this.ship.rotation.z = THREE.MathUtils.lerp(
      this.ship.rotation.z,
      -rollTarget,
      rotLerp
    );
  }
}