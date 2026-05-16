import * as THREE from 'three';
import { sampleOceanHeight } from '../ocean/OceanWaves.js';

export class ShipBuoyancy {
  constructor(ship) {
    this.ship = ship;

    this._worldPoint = new THREE.Vector3();
    this._tmp = new THREE.Vector3();
  }

  sampleHeight(localPoint, time) {
    this._worldPoint.copy(localPoint).applyMatrix4(this.ship.matrixWorld);
    return sampleOceanHeight(this._worldPoint.x, this._worldPoint.z, time);
  }

  update(time, delta) {
    this.ship.updateMatrixWorld(true);

    const fLen = this.ship.userData.forwardLength || 5.4;
    const sWid = this.ship.userData.sideWidth || 2.5;

    const front = new THREE.Vector3(0, 0, fLen);
    const back = new THREE.Vector3(0, 0, -fLen);
    const left = new THREE.Vector3(-sWid, 0, 0);
    const right = new THREE.Vector3(sWid, 0, 0);

    const frontH = this.sampleHeight(front, time);
    const backH = this.sampleHeight(back, time);
    const leftH = this.sampleHeight(left, time);
    const rightH = this.sampleHeight(right, time);

    const avgHeight = (frontH + backH + leftH + rightH) * 0.25;
    const targetY = avgHeight + this.ship.userData.waterlineOffset;

    // Amplify the height differences to make the ship crash through waves dramatically
    const pitchTarget = Math.atan2(
      (frontH - backH) * 2.5,
      fLen * 2.0
    );

    const rollTarget = Math.atan2(
      (rightH - leftH) * 1.5,
      sWid * 2.0
    );

    const yLerp = 1.0 - Math.exp(-3.5 * delta);
    const rotLerp = 1.0 - Math.exp(-3.0 * delta); // Slower, heavier rotation feel

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