import * as THREE from 'three';
import { createShip } from '../ship/Ship.js'; // Reuse ship model for MVP

export class MultiplayerManager {
  constructor(scene, networkManager) {
    this.scene = scene;
    this.networkManager = networkManager;
    this.remoteShips = {}; // socket.id -> mesh

    this.bindEvents();
  }

  bindEvents() {
    if (!this.networkManager || !this.networkManager.socket) return;
    const socket = this.networkManager.socket;

    socket.on('playerJoined', (player) => {
      this.addRemoteShip(player);
    });

    socket.on('playerMoved', (data) => {
      if (this.remoteShips[data.id]) {
        const ship = this.remoteShips[data.id];
        // For MVP, simple snap/lerp. We'll set a target and lerp in update()
        ship.userData.targetPosition.copy(data.position);
        ship.userData.targetRotationY = data.rotation.y;
      } else {
        // Just in case we missed them joining
        this.addRemoteShip(data);
      }
    });

    socket.on('playerLeft', (id) => {
      this.removeRemoteShip(id);
    });
    
    // Also add already existing players from the join response
    for (const id in this.networkManager.players) {
      if (id !== socket.id) {
        this.addRemoteShip(this.networkManager.players[id]);
      }
    }
  }

  addRemoteShip(player) {
    if (this.remoteShips[player.id]) return;

    const team = player.team || 'blue';
    const ship = createShip(team, player.shipClass || 'galleon');
    ship.position.copy(player.position);
    ship.rotation.y = player.rotation.y;

    ship.userData.targetPosition = new THREE.Vector3().copy(player.position);
    ship.userData.targetRotationY = player.rotation.y;
    ship.userData.id = player.id;
    
    this.scene.add(ship);
    this.remoteShips[player.id] = ship;
  }

  fireRemoteCannons(id, position, direction, side, projectileSystem) {
    const ship = this.remoteShips[id];
    if (!ship || !ship.userData.cannons) return;
    
    // Convert direction vector
    const dir = new THREE.Vector3(direction.x, direction.y, direction.z);

    ship.userData.cannons.forEach(cannon => {
      if (cannon.side === side) {
        const firePos = cannon.mesh.getWorldPosition(new THREE.Vector3());
        
        const shootDir = new THREE.Vector3().subVectors(position, firePos).normalize();
        // Since we only have the general target 'position', we use the original logic
        // But for simplicity, we can just use the provided general 'dir' and add variance
        const finalDir = dir.clone();
        finalDir.x += (Math.random() - 0.5) * 0.05;
        finalDir.z += (Math.random() - 0.5) * 0.05;
        finalDir.y += 0.05; // slight arc
        finalDir.normalize();

        projectileSystem.spawnProjectile(firePos, finalDir, ship.name);
        projectileSystem.spawnSmoke(firePos);
      }
    });
  }

  removeRemoteShip(id) {
    if (this.remoteShips[id]) {
      this.scene.remove(this.remoteShips[id]);
      delete this.remoteShips[id];
    }
  }

  update(delta) {
    // Interpolate remote ships
    for (const id in this.remoteShips) {
      const ship = this.remoteShips[id];
      ship.position.lerp(ship.userData.targetPosition, 10 * delta);
      
      // Simple rotation lerp (could have wrapping issues but fine for MVP)
      const diff = ship.userData.targetRotationY - ship.rotation.y;
      if (Math.abs(diff) > Math.PI) {
         if (diff > 0) ship.rotation.y += Math.PI * 2;
         else ship.rotation.y -= Math.PI * 2;
      }
      ship.rotation.y += (ship.userData.targetRotationY - ship.rotation.y) * 10 * delta;
    }
  }
}
