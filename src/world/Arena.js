import * as THREE from 'three';

export function createArena() {
  const arena = new THREE.Group();
  arena.name = 'Arena';

  // Vibrant, stylized materials
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x44dd44,
    roughness: 0.9,
    flatShading: true,
  });

  const sandMat = new THREE.MeshStandardMaterial({
    color: 0xffdd88,
    roughness: 1.0,
    flatShading: true,
  });

  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x8899aa,
    roughness: 0.8,
    flatShading: true,
  });

  // Main central island
  const mainIslandGeo = new THREE.CylinderGeometry(25, 30, 4, 12);
  const mainIsland = new THREE.Mesh(mainIslandGeo, grassMat);
  mainIsland.position.set(0, -1, 0);
  mainIsland.receiveShadow = true;
  mainIsland.castShadow = true;
  
  // Add some rocks to the main island
  for(let i=0; i<4; i++) {
     const rockGeo = new THREE.DodecahedronGeometry(5 + Math.random()*3);
     const rock = new THREE.Mesh(rockGeo, rockMat);
     rock.position.set((Math.random()-0.5)*30, 2, (Math.random()-0.5)*30);
     rock.rotation.y = Math.random() * Math.PI;
     rock.castShadow = true;
     rock.receiveShadow = true;
     mainIsland.add(rock);
  }

  // Calculate simple collision radius for the central island
  mainIsland.geometry.computeBoundingSphere();
  mainIsland.userData.radius = mainIsland.geometry.boundingSphere.radius;
  arena.add(mainIsland);

  // Red Team Spawn Island (North)
  const redIslandGeo = new THREE.CylinderGeometry(15, 18, 2, 8);
  const redIsland = new THREE.Mesh(redIslandGeo, sandMat);
  redIsland.position.set(0, -0.5, -80);
  redIsland.receiveShadow = true;
  redIsland.castShadow = true;
  redIsland.geometry.computeBoundingSphere();
  redIsland.userData.radius = redIsland.geometry.boundingSphere.radius;
  arena.add(redIsland);

  // Blue Team Spawn Island (South)
  const blueIslandGeo = new THREE.CylinderGeometry(15, 18, 2, 8);
  const blueIsland = new THREE.Mesh(blueIslandGeo, sandMat);
  blueIsland.position.set(0, -0.5, 80);
  blueIsland.receiveShadow = true;
  blueIsland.castShadow = true;
  blueIsland.geometry.computeBoundingSphere();
  blueIsland.userData.radius = blueIsland.geometry.boundingSphere.radius;
  arena.add(blueIsland);

  // Add perimeter rocks so you can't sail forever
  const numRocks = 16;
  const radius = 120;
  for (let i = 0; i < numRocks; i++) {
    const angle = (i / numRocks) * Math.PI * 2;
    const rockGeo = new THREE.DodecahedronGeometry(12, 1);
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(Math.cos(angle) * radius, -2, Math.sin(angle) * radius);
    rock.scale.set(1, 2, 1);
    rock.rotation.y = Math.random() * Math.PI;
    rock.castShadow = true;
    rock.receiveShadow = true;
    rock.geometry.computeBoundingSphere();
    rock.userData.radius = rock.geometry.boundingSphere.radius * 0.9;
    arena.add(rock);
  }

  // Spawn positions
  arena.userData.spawnPoints = {
    red: new THREE.Vector3(0, 1.0, -60), // Just outside the red island
    blue: new THREE.Vector3(0, 1.0, 60), // Just outside the blue island
  };

  return arena;
}
