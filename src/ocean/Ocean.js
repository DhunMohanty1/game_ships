import * as THREE from 'three';
import { createOceanMaterial } from './OceanMaterial.js';

export class Ocean {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'Ocean';

    this.tileSize = 240;
    this.segments = 96;
    this.material = createOceanMaterial();
    this.tiles = [];

    const geometry = new THREE.PlaneGeometry(
      this.tileSize,
      this.tileSize,
      this.segments,
      this.segments
    );
    geometry.rotateX(-Math.PI / 2);

    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        const tile = new THREE.Mesh(geometry, this.material);
        tile.position.set(x * this.tileSize, 0, z * this.tileSize);
        this.group.add(tile);
        this.tiles.push(tile);
      }
    }
  }

  update(time, shipPosition) {
    this.material.uniforms.uTime.value = time;

    const centerX = Math.floor(shipPosition.x / this.tileSize) * this.tileSize;
    const centerZ = Math.floor(shipPosition.z / this.tileSize) * this.tileSize;

    let index = 0;
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        const tile = this.tiles[index++];
        tile.position.set(
          centerX + x * this.tileSize,
          0,
          centerZ + z * this.tileSize
        );
      }
    }
  }
}