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

  // Helper to create islands
  const createIsland = (x, z, radius, isSpawn = false) => {
    const island = new THREE.Group();
    island.position.set(x, 0, z);

    const baseGeo = new THREE.CylinderGeometry(radius, radius * 1.2, 4, 12);
    const base = new THREE.Mesh(baseGeo, isSpawn ? sandMat : grassMat);
    base.position.y = -1;
    base.receiveShadow = true;
    base.castShadow = true;
    base.geometry.computeBoundingSphere();
    base.userData.radius = base.geometry.boundingSphere.radius;
    island.add(base);

    // Add some rocks
    const numRocks = Math.floor(radius / 5);
    for(let i=0; i<numRocks; i++) {
       const rockGeo = new THREE.DodecahedronGeometry(3 + Math.random()*5);
       const rock = new THREE.Mesh(rockGeo, rockMat);
       rock.position.set((Math.random()-0.5)*radius*1.2, 2, (Math.random()-0.5)*radius*1.2);
       rock.rotation.y = Math.random() * Math.PI;
       rock.castShadow = true;
       rock.receiveShadow = true;
       rock.geometry.computeBoundingSphere();
       rock.userData.radius = rock.geometry.boundingSphere.radius;
       island.add(rock);
    }

    return island;
  };

  // Main central island
  arena.add(createIsland(0, 0, 45));

  // Additional islands scattered around
  arena.add(createIsland(120, 80, 25));
  arena.add(createIsland(-100, -120, 30));
  arena.add(createIsland(150, -100, 20));
  arena.add(createIsland(-140, 130, 35));

  // Massive rock formations
  for (let i = 0; i < 15; i++) {
     const rockGeo = new THREE.DodecahedronGeometry(15 + Math.random()*15, 1);
     const rock = new THREE.Mesh(rockGeo, rockMat);
     rock.position.set((Math.random()-0.5)*500, 5, (Math.random()-0.5)*500);
     rock.scale.set(1, 2 + Math.random()*2, 1);
     rock.rotation.y = Math.random() * Math.PI;
     rock.castShadow = true;
     rock.receiveShadow = true;
     rock.geometry.computeBoundingSphere();
     rock.userData.radius = rock.geometry.boundingSphere.radius * 0.9;
     arena.add(rock);
  }

  // Red Team Spawn Island (North)
  const redIsland = createIsland(0, -320, 30, true);
  arena.add(redIsland);

  // Blue Team Spawn Island (South)
  const blueIsland = createIsland(0, 320, 30, true);
  arena.add(blueIsland);

  // Add perimeter rocks so you can't sail forever
  const numRocks = 36;
  const mapRadius = 400;
  for (let i = 0; i < numRocks; i++) {
    const angle = (i / numRocks) * Math.PI * 2;
    const rockGeo = new THREE.DodecahedronGeometry(18, 1);
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(Math.cos(angle) * mapRadius, -2, Math.sin(angle) * mapRadius);
    rock.scale.set(1, 3, 1);
    rock.rotation.y = Math.random() * Math.PI;
    rock.castShadow = true;
    rock.receiveShadow = true;
    rock.geometry.computeBoundingSphere();
    rock.userData.radius = rock.geometry.boundingSphere.radius * 0.9;
    arena.add(rock);
  }

  // Spawn positions
  arena.userData.spawnPoints = {
    red: new THREE.Vector3(0, 1.0, -280), // Just south of the red island
    blue: new THREE.Vector3(0, 1.0, 280), // Just north of the blue island
  };

  return arena;
}
