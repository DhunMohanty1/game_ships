import * as THREE from 'three';

export function createBattlefield() {
  const battlefield = new THREE.Group();
  battlefield.name = 'Battlefield';

  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x4a4d52,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: false,
  });

  const sandMat = new THREE.MeshStandardMaterial({
    color: 0x8c7853,
    roughness: 1.0,
    flatShading: false,
  });

  const numRocks = 12;
  const radius = 120; // Size of the arena

  // Create a perimeter of rocks
  for (let i = 0; i < numRocks; i++) {
    const angle = (i / numRocks) * Math.PI * 2 + (Math.random() * 0.2);
    
    // Some rocks are bigger clusters
    const clusterSize = Math.random() > 0.7 ? 3 : 1;
    
    for(let j=0; j<clusterSize; j++) {
      const geo = new THREE.DodecahedronGeometry(8 + Math.random() * 10, 2);
      
      // Jitter vertices for jagged realism
      const pos = geo.attributes.position;
      for(let k=0; k<pos.count; k++) {
        pos.setY(k, pos.getY(k) * (1.0 + Math.random()));
      }
      geo.computeVertexNormals();

      const rock = new THREE.Mesh(geo, rockMat);
      
      const r = radius + (Math.random() - 0.5) * 20;
      const x = Math.cos(angle) * r + (Math.random() - 0.5) * 15;
      const z = Math.sin(angle) * r + (Math.random() - 0.5) * 15;
      
      rock.position.set(x, -2 + Math.random() * 5, z);
      rock.rotation.y = Math.random() * Math.PI;
      rock.rotation.x = (Math.random() - 0.5) * 0.5;
      
      // Scale vertically for jagged peaks
      rock.scale.set(1.0, 1.5 + Math.random() * 1.5, 1.0);
      
      rock.castShadow = true;
      rock.receiveShadow = true;
      
      // We will attach a bounding sphere for physics
      rock.geometry.computeBoundingSphere();
      rock.userData.radius = rock.geometry.boundingSphere.radius * Math.max(rock.scale.x, rock.scale.z) * 0.8;
      
      battlefield.add(rock);
    }
  }

  // Add a massive central structure or a few obstacles inside
  for(let i=0; i<5; i++) {
    const geo = new THREE.DodecahedronGeometry(6 + Math.random() * 6, 2);
    const pos = geo.attributes.position;
    for(let k=0; k<pos.count; k++) {
      pos.setY(k, pos.getY(k) * (1.5 + Math.random() * 0.5));
    }
    geo.computeVertexNormals();
    
    const rock = new THREE.Mesh(geo, rockMat);
    
    const r = Math.random() * (radius * 0.5);
    const angle = Math.random() * Math.PI * 2;
    
    rock.position.set(Math.cos(angle) * r, -1, Math.sin(angle) * r);
    rock.scale.set(1, 2 + Math.random() * 2, 1);
    
    rock.castShadow = true;
    rock.receiveShadow = true;
    
    rock.geometry.computeBoundingSphere();
    rock.userData.radius = rock.geometry.boundingSphere.radius * Math.max(rock.scale.x, rock.scale.z) * 0.8;

    battlefield.add(rock);
  }

  return battlefield;
}
