import * as THREE from 'three';

export class CameraController {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;

    this.followOffset = new THREE.Vector3(0, 6.5, -15.5);
    this.lookAheadOffset = new THREE.Vector3(0, 1.8, 10.0);

    this._yawQuat = new THREE.Quaternion();
    this._desiredPos = new THREE.Vector3();
    this._lookAtPos = new THREE.Vector3();
  }

  update(delta) {
    this._yawQuat.setFromEuler(
      new THREE.Euler(0, this.target.rotation.y, 0, 'YXZ')
    );

    this._desiredPos
      .copy(this.followOffset)
      .applyQuaternion(this._yawQuat)
      .add(this.target.position);

    this._lookAtPos
      .copy(this.lookAheadOffset)
      .applyQuaternion(this._yawQuat)
      .add(this.target.position);

    const t = 1.0 - Math.exp(-4.5 * delta);

    this.camera.position.lerp(this._desiredPos, t);
    this.camera.lookAt(this._lookAtPos);
  }
}