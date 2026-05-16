import * as THREE from 'three';

export function createShip(team = 'red') {
  const group = new THREE.Group();
  group.name = 'PirateShip';

  // Saturated Cartoon Colors
  const teamColorHex = team === 'blue' ? 0x2255ff : 0xff3322;
  
  const hullMaterial = new THREE.MeshStandardMaterial({
    color: teamColorHex,
    roughness: 0.6,
    metalness: 0.0,
    flatShading: true,
  });

  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x5c3a21,
    roughness: 0.8,
    metalness: 0.0,
    flatShading: true,
  });

  const deckMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a5a19,
    roughness: 0.9,
    metalness: 0.0,
    flatShading: true,
  });

  const clothMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Bright white sail
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide,
    flatShading: true,
  });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.5,
    metalness: 0.5,
    flatShading: true,
  });

  // Scale factor to make the ship larger and chunkier
  const s = 1.8;

  // Main Hull (Chunky oval shape)
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(3.5 * s, 1.8 * s, 7 * s),
    hullMaterial
  );
  hull.position.y = 0.9 * s;

  // Deck
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(3.4 * s, 0.4 * s, 6.8 * s),
    deckMaterial
  );
  deck.position.set(0, 1.8 * s, 0);

  // Masts (Thick and cartoonish)
  const mainMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3 * s, 0.3 * s, 6 * s, 8),
    darkWoodMat
  );
  mainMast.position.set(0, 4.0 * s, 0);

  const sailsList = [];

  // Simple, oversized sail
  const createSail = (w, h, mast, yOffset, zOffset) => {
    const boom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15 * s, 0.15 * s, w * s, 8),
      darkWoodMat
    );
    boom.rotation.z = Math.PI / 2;
    boom.position.set(0, yOffset * s, zOffset * s);
    sailsList.push(boom);

    const sail = new THREE.Mesh(
      new THREE.PlaneGeometry(w * s, h * s, 2, 2),
      clothMaterial
    );
    sail.position.set(0, (yOffset - h / 2) * s, (zOffset + 0.2) * s);
    
    // Add billow
    const pos = sail.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const billow = Math.cos((px / (w * s)) * Math.PI) * 1.5;
      pos.setZ(i, pos.getZ(i) + billow);
    }
    sail.geometry.computeVertexNormals();
    sailsList.push(sail);
  };

  createSail(4.5, 4.0, mainMast, 6.5, -0.5); 

  // Big, exaggerated cannons
  group.userData.cannons = [];
  const cannonGroups = [];
  
  const addCannon = (x, z, side) => {
    const cannonGroup = new THREE.Group();
    
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3 * s, 0.4 * s, 1.5 * s, 8),
      metalMaterial
    );
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(side === 'right' ? 0.6 * s : -0.6 * s, 0.3 * s, 0);
    cannonGroup.add(barrel);

    cannonGroup.position.set(x, 2.0 * s, z);
    cannonGroups.push(cannonGroup);
    
    group.userData.cannons.push({
       mesh: cannonGroup,
       barrelMesh: barrel,
       side: side,
       localPos: new THREE.Vector3(x, 2.0 * s, z),
       fireOffset: new THREE.Vector3(side === 'right' ? 1.5 * s : -1.5 * s, 0.3 * s, 0)
    });
  };

  // Only 2 massive cannons per side for a kart-racer feel
  addCannon(1.6 * s, 1.5 * s, 'right');
  addCannon(1.6 * s, -1.5 * s, 'right');
  addCannon(-1.6 * s, 1.5 * s, 'left');
  addCannon(-1.6 * s, -1.5 * s, 'left');

  // Group parts for destruction
  const parts = {
    mast: new THREE.Group(),
    hull: new THREE.Group()
  };
  
  parts.hull.add(hull, deck);
  cannonGroups.forEach(c => parts.hull.add(c));

  parts.mast.add(mainMast);
  sailsList.forEach(s => parts.mast.add(s));
  
  group.add(parts.hull);
  group.add(parts.mast);

  group.userData.waterlineOffset = 1.0 * s;
  group.userData.forwardLength = 3.5 * s;
  group.userData.sideWidth = 2.0 * s;
  group.userData.anchorDown = false;
  group.userData.team = team;
  
  group.userData.radius = 3.0 * s; // Small collision radius
  group.userData.parts = parts;
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