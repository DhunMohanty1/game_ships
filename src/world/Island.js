import * as THREE from 'three';

function makePalm() {
  const palm = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x7a4a2c,
    roughness: 1.0,
    flatShading: true,
  });

  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x4aa84e,
    roughness: 1.0,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.28, 4.2, 6),
    trunkMat
  );
  trunk.position.y = 2.1;
  trunk.rotation.z = THREE.MathUtils.degToRad(-8);
  palm.add(trunk);

  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.45, 1, 1),
      leafMat
    );
    leaf.position.y = 4.25;
    leaf.rotation.y = (Math.PI * 2 * i) / 5;
    leaf.rotation.z = THREE.MathUtils.degToRad(-25);
    leaf.position.x = Math.cos(leaf.rotation.y) * 0.55;
    leaf.position.z = Math.sin(leaf.rotation.y) * 0.55;
    palm.add(leaf);
  }

  return palm;
}

export function createIsland() {
  const island = new THREE.Group();
  island.name = 'Island';

  const sandMat = new THREE.MeshStandardMaterial({
    color: 0xdac48a,
    roughness: 1.0,
    flatShading: true,
  });

  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x4fa84a,
    roughness: 1.0,
    flatShading: true,
  });

  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x8b8f98,
    roughness: 1.0,
    flatShading: true,
  });

  const base = new THREE.Mesh(
    new THREE.IcosahedronGeometry(18, 2),
    sandMat
  );
  base.scale.set(1.45, 0.48, 1.2);
  base.position.y = -1.9;
  island.add(base);

  const top = new THREE.Mesh(
    new THREE.IcosahedronGeometry(11, 1),
    grassMat
  );
  top.scale.set(1.25, 0.35, 1.1);
  top.position.set(-1.0, 0.8, 0.4);
  island.add(top);

  const rock1 = new THREE.Mesh(
    new THREE.DodecahedronGeometry(2.0, 0),
    rockMat
  );
  rock1.scale.set(1.2, 0.75, 1.0);
  rock1.position.set(-6.5, 0.3, 4.5);
  island.add(rock1);

  const rock2 = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.5, 0),
    rockMat
  );
  rock2.scale.set(1.1, 0.8, 0.9);
  rock2.position.set(7.0, 0.2, -5.0);
  island.add(rock2);

  const palm1 = makePalm();
  palm1.position.set(-4.5, 1.0, -1.5);
  palm1.rotation.y = 0.6;
  island.add(palm1);

  const palm2 = makePalm();
  palm2.position.set(4.0, 0.9, 3.0);
  palm2.rotation.y = -1.2;
  island.add(palm2);

  const palm3 = makePalm();
  palm3.position.set(0.5, 1.0, -5.5);
  palm3.rotation.y = 2.0;
  island.add(palm3);

  island.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = false;
      obj.receiveShadow = false;
    }
  });

  return island;
}