import * as THREE from 'three';

export function createShip() {
  const ship = new THREE.Group();
  ship.name = 'PlayerShip';

  const hullMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b3d20,
    roughness: 1.0,
    metalness: 0.0,
    flatShading: true,
  });

  const darkWoodMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a2417,
    roughness: 1.0,
    metalness: 0.0,
    flatShading: true,
  });

  const deckMaterial = new THREE.MeshStandardMaterial({
    color: 0x9a6a3a,
    roughness: 1.0,
    metalness: 0.0,
    flatShading: true,
  });

  const clothMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2efe7,
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const flagMaterial = new THREE.MeshStandardMaterial({
    color: 0xf26d6d,
    roughness: 1.0,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  // Hull
  const hull = new THREE.Mesh(
    new THREE.CylinderGeometry(1.55, 1.15, 10.6, 6, 1, false),
    hullMaterial
  );
  hull.rotation.x = Math.PI / 2;
  hull.scale.set(1.25, 1.0, 1.0);
  hull.position.y = 0.0;
  ship.add(hull);

  // Keel
  const keel = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.25, 8.5),
    darkWoodMaterial
  );
  keel.position.set(0, -0.72, 0);
  ship.add(keel);

  // Deck
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.35, 6.8),
    deckMaterial
  );
  deck.position.set(0, 0.72, 0);
  ship.add(deck);

  // Bow
  const bow = new THREE.Mesh(
    new THREE.ConeGeometry(1.05, 2.1, 6),
    hullMaterial
  );
  bow.rotation.x = Math.PI / 2;
  bow.position.set(0, 0.05, 5.9);
  ship.add(bow);

  // Stern
  const stern = new THREE.Mesh(
    new THREE.ConeGeometry(0.95, 1.8, 6),
    hullMaterial
  );
  stern.rotation.x = -Math.PI / 2;
  stern.position.set(0, 0.05, -5.85);
  ship.add(stern);

  // Cabin
  const cabinBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.1, 2.6),
    darkWoodMaterial
  );
  cabinBase.position.set(0, 1.25, -1.8);
  ship.add(cabinBase);

  const cabinRoof = new THREE.Mesh(
    new THREE.CylinderGeometry(1.55, 1.55, 0.6, 6),
    deckMaterial
  );
  cabinRoof.rotation.x = Math.PI / 2;
  cabinRoof.position.set(0, 1.95, -1.8);
  ship.add(cabinRoof);

  // Mast
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, 8.8, 6),
    darkWoodMaterial
  );
  mast.position.set(0, 4.2, -0.3);
  ship.add(mast);

  // Boom
  const boom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 4.9, 6),
    darkWoodMaterial
  );
  boom.rotation.z = Math.PI / 2;
  boom.position.set(0.55, 3.0, -0.3);
  ship.add(boom);

  // Main sail
  const sail1 = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 3.3, 1, 1),
    clothMaterial
  );
  sail1.position.set(1.55, 3.45, -0.35);
  sail1.rotation.y = -Math.PI / 2;
  ship.add(sail1);

  // Front sail
  const sail2 = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 2.7, 1, 1),
    clothMaterial
  );
  sail2.position.set(-0.95, 2.95, 0.5);
  sail2.rotation.y = -Math.PI / 2;
  sail2.rotation.z = 0.12;
  ship.add(sail2);

  // Flag
  const flagPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 1.5, 4),
    darkWoodMaterial
  );
  flagPole.position.set(0, 5.4, -0.1);
  ship.add(flagPole);

  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.55),
    flagMaterial
  );
  flag.position.set(0.45, 5.55, -0.1);
  flag.rotation.y = -Math.PI / 2;
  ship.add(flag);

  // Railings
  for (let i = -1; i <= 1; i++) {
    const railL = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.25, 6.3),
      darkWoodMaterial
    );
    railL.position.set(-1.55, 1.15, i * 0.05);
    ship.add(railL);

    const railR = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.25, 6.3),
      darkWoodMaterial
    );
    railR.position.set(1.55, 1.15, i * 0.05);
    ship.add(railR);
  }

  ship.userData = {
    waterlineOffset: 0.95,
    forwardLength: 5.4,
    sideWidth: 2.5,
    anchorDown: false,
  };

  ship.position.y = 1.0;
  ship.rotation.y = 0;

  ship.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = false;
      obj.receiveShadow = false;
    }
  });

  return ship;
}