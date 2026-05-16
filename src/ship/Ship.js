import * as THREE from 'three';

export function createShip(team = 'red', shipClass = 'galleon') {
  const group = new THREE.Group();
  group.name = 'PirateShip';

  // Pirate aesthetics: Dark wood, tattered/black sails, gold trim
  const teamColorHex = team === 'blue' ? 0x1133aa : 0xaa2211;
  
  const hullMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a120e, // Very dark wood
    roughness: 0.8,
    metalness: 0.1,
  });

  const trimMaterial = new THREE.MeshStandardMaterial({
    color: teamColorHex,
    roughness: 0.6,
    metalness: 0.2,
  });

  const deckMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d2817,
    roughness: 0.9,
    metalness: 0.0,
  });

  const clothMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111, // Black sails
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.4,
    metalness: 0.8,
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.3,
    metalness: 1.0,
  });

  // Base scale and stats based on ship class
  let s = 1.0;
  let lengthMult = 1.0;
  let cannonsPerSide = 1;
  let turnSpeedMult = 1.0;
  let speedMult = 1.0;
  let masts = 1;
  let maxHealth = 150;
  let reloadTime = 2.0;

  switch (shipClass) {
    case 'sloop':
      s = 1.2; lengthMult = 0.8; cannonsPerSide = 1; turnSpeedMult = 1.5; speedMult = 1.3; masts = 1; maxHealth = 100; reloadTime = 1.5;
      break;
    case 'brigantine':
      s = 1.4; lengthMult = 0.9; cannonsPerSide = 2; turnSpeedMult = 1.2; speedMult = 1.1; masts = 2; maxHealth = 150; reloadTime = 2.0;
      break;
    case 'frigate':
      s = 1.6; lengthMult = 1.0; cannonsPerSide = 3; turnSpeedMult = 1.0; speedMult = 1.0; masts = 3; maxHealth = 200; reloadTime = 2.5;
      break;
    case 'galleon':
      s = 1.8; lengthMult = 1.1; cannonsPerSide = 4; turnSpeedMult = 0.7; speedMult = 0.8; masts = 3; maxHealth = 300; reloadTime = 3.0;
      break;
    case 'manowar':
      s = 2.2; lengthMult = 1.3; cannonsPerSide = 6; turnSpeedMult = 0.4; speedMult = 0.6; masts = 4; maxHealth = 450; reloadTime = 4.0;
      break;
  }

  // Hull Geometry
  const hullLength = 7 * s * lengthMult;
  const hullWidth = 3.5 * s;
  const hullHeight = 1.8 * s;
  
  // Create a curved hull using simple primitives mapped together
  const hullGeo = new THREE.CylinderGeometry(hullWidth/2, hullWidth/3, hullLength, 12, 1, false);
  const hull = new THREE.Mesh(hullGeo, hullMaterial);
  hull.rotation.x = Math.PI / 2;
  hull.position.y = hullHeight / 2;

  // Deck
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(hullWidth * 0.9, 0.2 * s, hullLength * 0.9),
    deckMaterial
  );
  deck.position.set(0, hullHeight * 0.8, 0);

  // Captain's Cabin
  const cabinBase = new THREE.Mesh(
    new THREE.BoxGeometry(hullWidth * 0.8, hullHeight * 0.8, hullLength * 0.3),
    hullMaterial
  );
  cabinBase.position.set(0, hullHeight * 1.2, -hullLength * 0.35);

  // Lanterns (Glowing)
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xffaa00,
    emissiveIntensity: 2.0,
  });
  
  const addLantern = (x, y, z) => {
     const l = new THREE.Mesh(new THREE.SphereGeometry(0.15*s), lanternMat);
     l.position.set(x, y, z);
     const light = new THREE.PointLight(0xffaa00, 2, 10*s);
     light.position.set(0, 0, 0);
     l.add(light);
     return l;
  };

  const l1 = addLantern(hullWidth*0.4, hullHeight*1.5, -hullLength*0.5);
  const l2 = addLantern(-hullWidth*0.4, hullHeight*1.5, -hullLength*0.5);

  const sailsList = [];
  const mastGroups = [];

  const addMast = (zPos, height) => {
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15 * s, 0.2 * s, height * s, 8),
      hullMaterial
    );
    mast.position.set(0, (height*s)/2, zPos);
    mastGroups.push(mast);

    // Sails
    const numSails = Math.floor(height / 3);
    for (let i = 0; i < numSails; i++) {
       const sailW = hullWidth * 1.5 * (1 - i*0.15);
       const sailH = 2.5 * s;
       const yOffset = height*s - (i * sailH * 1.2) - sailH/2;

       const boom = new THREE.Mesh(
         new THREE.CylinderGeometry(0.08 * s, 0.08 * s, sailW, 8),
         hullMaterial
       );
       boom.rotation.z = Math.PI / 2;
       boom.position.set(0, yOffset + sailH/2, 0);
       mast.add(boom);

       const sail = new THREE.Mesh(
         new THREE.PlaneGeometry(sailW, sailH, 4, 4),
         clothMaterial
       );
       sail.position.set(0, yOffset, 0.2*s);
       
       // Billow
       const pos = sail.geometry.attributes.position;
       for (let j = 0; j < pos.count; j++) {
         const px = pos.getX(j);
         const billow = Math.cos((px / sailW) * Math.PI) * (1.0*s);
         pos.setZ(j, pos.getZ(j) + billow);
       }
       sail.geometry.computeVertexNormals();
       mast.add(sail);
       sailsList.push(sail);
    }
  };

  // Add masts based on class
  if (masts === 1) {
    addMast(0, 8);
  } else if (masts === 2) {
    addMast(-hullLength*0.1, 9);
    addMast(hullLength*0.25, 7);
  } else if (masts === 3) {
    addMast(-hullLength*0.2, 10);
    addMast(hullLength*0.05, 11);
    addMast(hullLength*0.3, 8);
  } else if (masts === 4) {
    addMast(-hullLength*0.3, 11);
    addMast(-hullLength*0.05, 12);
    addMast(hullLength*0.2, 10);
    addMast(hullLength*0.4, 8);
  }

  // Cannons
  group.userData.cannons = [];
  const cannonGroups = [];
  
  const addCannon = (x, z, side) => {
    const cannonGroup = new THREE.Group();
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15 * s, 0.2 * s, 1.2 * s, 8),
      metalMaterial
    );
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(side === 'right' ? 0.4 * s : -0.4 * s, 0.2 * s, 0);
    cannonGroup.add(barrel);

    cannonGroup.position.set(x, hullHeight * 0.9, z);
    cannonGroups.push(cannonGroup);
    
    group.userData.cannons.push({
       mesh: cannonGroup,
       barrelMesh: barrel,
       side: side,
       localPos: new THREE.Vector3(x, hullHeight * 0.9, z),
       fireOffset: new THREE.Vector3(side === 'right' ? 1.0 * s : -1.0 * s, 0.2 * s, 0)
    });
  };

  const spacing = hullLength * 0.6 / cannonsPerSide;
  const startZ = (hullLength * 0.3) - (spacing/2);
  
  for(let i=0; i<cannonsPerSide; i++) {
     const zPos = startZ - (i * spacing);
     addCannon(hullWidth * 0.45, zPos, 'right');
     addCannon(-hullWidth * 0.45, zPos, 'left');
  }

  const parts = {
    mast: new THREE.Group(),
    hull: new THREE.Group()
  };
  
  parts.hull.add(hull, deck, cabinBase, l1, l2);
  cannonGroups.forEach(c => parts.hull.add(c));
  mastGroups.forEach(m => parts.mast.add(m));
  
  group.add(parts.hull);
  group.add(parts.mast);

  group.userData.waterlineOffset = hullHeight * 0.5;
  group.userData.forwardLength = hullLength * 0.5;
  group.userData.sideWidth = hullWidth * 0.5;
  group.userData.anchorDown = false;
  group.userData.team = team;
  group.userData.shipClass = shipClass;
  
  // Specific physics stats based on class
  group.userData.radius = (hullWidth * 0.6); 
  group.userData.speedMult = speedMult;
  group.userData.turnSpeedMult = turnSpeedMult;
  group.userData.maxHealth = maxHealth;
  group.userData.health = maxHealth;
  group.userData.reloadTime = reloadTime;

  group.userData.parts = parts;
  group.userData.sails = sailsList;
  group.userData.isMastBroken = false;

  group.position.y = 1.0;

  group.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return group;
}