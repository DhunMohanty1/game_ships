import * as THREE from 'three';

export class PhysicsSystem {
  constructor(scene, battlefield, projectileSystem, multiplayerManager) {
    this.scene = scene;
    this.battlefield = battlefield;
    this.projectileSystem = projectileSystem;
    this.multiplayerManager = multiplayerManager;
    
    this.ships = [];
  }

  addShip(ship) {
    if (ship && !this.ships.includes(ship)) {
      this.ships.push(ship);
    }
  }

  removeShip(ship) {
    const idx = this.ships.indexOf(ship);
    if (idx !== -1) {
      this.ships.splice(idx, 1);
    }
  }

  update(delta, mainShip) {
    // 1. Rock Collisions
    if (this.battlefield) {
      this.battlefield.children.forEach(rock => {
        if (!rock.userData.radius) return;
        
        // Check collision between mainShip and rock
        const dist = mainShip.position.distanceTo(rock.position);
        const minDist = mainShip.userData.radius + rock.userData.radius;
        
        if (dist < minDist) {
          // Push ship out
          const pushDir = new THREE.Vector3().subVectors(mainShip.position, rock.position).normalize();
          const overlap = minDist - dist;
          mainShip.position.add(pushDir.multiplyScalar(overlap));
          
          // Kill velocity
          mainShip.userData.speed *= 0.8; 
          
          // Damage visual (could trigger camera shake)
          const event = new CustomEvent('cameraShake', { detail: { intensity: 1.5 } });
          window.dispatchEvent(event);
        }
      });
    }

    // 2. Projectile vs Ships (Destruction check)
    // For every projectile, see if it hits any ship (including multiplayer ships)
    const allShips = [mainShip];
    if (this.multiplayerManager) {
      Object.values(this.multiplayerManager.remoteShips).forEach(s => allShips.push(s));
    }

    for (let i = this.projectileSystem.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectileSystem.projectiles[i];
      let hit = false;
      
      for (const ship of allShips) {
        // Don't hit self immediately (wait 0.5s or just check distance)
        if (proj.ownerId === ship.name && proj.life < 0.2) continue;

        // Tighter bounding sphere for projectiles
        const shipRadius = ship.userData.radius || 4.0;
        const dist = proj.mesh.position.distanceTo(ship.position);
        
        if (dist < shipRadius) {
          hit = true;
          this.triggerHit(ship, proj.mesh.position);
          break;
        }
      }

      if (hit) {
        // Destroy projectile
        this.scene.remove(proj.mesh);
        this.projectileSystem.projectiles.splice(i, 1);
      }
    }
  }

  triggerHit(ship, hitPos) {
    // Spawn explosion
    this.projectileSystem.spawnExplosion(hitPos);
    this.projectileSystem.spawnDebris(hitPos);

    // Component breaking
    if (ship.userData.parts && !ship.userData.isMastBroken) {
      // If hit is high enough, break the mast
      if (hitPos.y > ship.position.y + 6.0) {
        ship.userData.isMastBroken = true;
        // Hide mast
        if (ship.userData.parts.mast) {
          ship.userData.parts.mast.visible = false;
        }
        
        // Spawn massive debris from mast
        const mastPos = ship.position.clone();
        mastPos.y += 8.0;
        for(let i=0; i<3; i++) {
          this.projectileSystem.spawnDebris(mastPos);
        }
      }
    }
  }
}
