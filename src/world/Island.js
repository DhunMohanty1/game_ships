import * as THREE from 'three';

function makePalm() {
  const palm = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x5c371d, // Darker trunk
    roughness: 1.0,
    flatShading: true,
  });

  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x3d8c40, // Richer green
    roughness: 0.9,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.4, 6.0, 6),
    trunkMat
  );
  trunk.position.y = 3.0;
  trunk.rotation.z = THREE.MathUtils.degToRad(-12);
  palm.add(trunk);

  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 0.6, 1, 1),
      leafMat
    );
    leaf.position.y = 5.8;
    leaf.rotation.y = (Math.PI * 2 * i) / 7;
    leaf.rotation.z = THREE.MathUtils.degToRad(-30 - Math.random() * 15);
    leaf.position.x = Math.cos(leaf.rotation.y) * 0.8;
    leaf.position.z = Math.sin(leaf.rotation.y) * 0.8;
    palm.add(leaf);
  }

  return palm;
}

export function createIsland() {
  const island = new THREE.Group();
  island.name = 'Island';

  const sandMat = new THREE.MeshStandardMaterial({
    color: 0xe6cc98, // Warmer sand
    roughness: 1.0,
    flatShading: true,
  });

  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x4fa84a,
    roughness: 1.0,
    flatShading: true,
  });

  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x757982, // Darker rocks
    roughness: 1.0,
    flatShading: true,
  });

  // Base sand
  const baseGeo = new THREE.IcosahedronGeometry(22, 2);
  // Add some noise to sand vertices
  const basePos = baseGeo.attributes.position;
  for (let i = 0; i < basePos.count; i++) {
    basePos.setY(i, basePos.getY(i) + (Math.random() - 0.5) * 1.5);
  }
  baseGeo.computeVertexNormals();

  const base = new THREE.Mesh(baseGeo, sandMat);
  base.scale.set(1.4, 0.4, 1.2);
  base.position.y = -2.5;
  island.add(base);

  // Top grass
  const topGeo = new THREE.IcosahedronGeometry(13, 2);
  const topPos = topGeo.attributes.position;
  for (let i = 0; i < topPos.count; i++) {
    topPos.setY(i, topPos.getY(i) + (Math.random() - 0.5) * 2.5);
  }
  topGeo.computeVertexNormals();

  const top = new THREE.Mesh(topGeo, grassMat);
  top.scale.set(1.3, 0.5, 1.1);
  top.position.set(-1.0, 1.2, 0.4);
  island.add(top);

  // Add a bunch of rocks
  for (let i = 0; i < 8; i++) {
    const r = 2.0 + Math.random() * 2.0;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 0),
      rockMat
    );
    rock.scale.set(1.0 + Math.random()*0.5, 0.6 + Math.random()*0.5, 1.0 + Math.random()*0.5);
    
    const angle = Math.random() * Math.PI * 2;
    const dist = 8 + Math.random() * 12;
    rock.position.set(
      Math.cos(angle) * dist,
      -0.5 + Math.random() * 2.0,
      Math.sin(angle) * dist
    );
    rock.rotation.y = Math.random() * Math.PI;
    rock.rotation.z = Math.random() * 0.5;
    island.add(rock);
  }

  // Add palms
  const palmPositions = [
    [-4.5, 2.0, -1.5],
    [4.0, 1.5, 3.0],
    [0.5, 2.5, -5.5],
    [-8.0, 1.0, 4.0],
    [8.0, 0.5, -3.0],
  ];

  palmPositions.forEach(pos => {
    const palm = makePalm();
    palm.position.set(pos[0], pos[1], pos[2]);
    palm.rotation.y = Math.random() * Math.PI * 2;
    const s = 0.8 + Math.random() * 0.4;
    palm.scale.set(s, s, s);
    island.add(palm);
  });

  island.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return island;
}