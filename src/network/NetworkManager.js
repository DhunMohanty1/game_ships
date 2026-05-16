export class NetworkManager {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.players = {};
    this.isHost = false;
  }

  connect() {
    if (typeof io !== 'undefined') {
      this.socket = io();
    } else {
      console.warn('Socket.IO not found. Running in offline mode.');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.roomId = null;
    this.players = {};
    this.isHost = false;
  }

  createRoom() {
    return new Promise((resolve) => {
      if (!this.socket) this.connect();
      if (!this.socket) return resolve({ success: false });

      this.socket.emit('createRoom', (res) => {
        if (res.success) {
          this.roomId = res.roomId;
          this.isHost = true;
        }
        resolve(res);
      });
    });
  }

  joinRoom(roomId) {
    return new Promise((resolve) => {
      if (!this.socket) this.connect();
      if (!this.socket) return resolve({ success: false });

      this.socket.emit('joinRoom', roomId, (res) => {
        if (res.success) {
          this.roomId = res.roomId;
          this.players = res.players;
          this.isHost = false;
        }
        resolve(res);
      });
    });
  }

  sendMove(position, rotation) {
    if (this.socket && this.roomId) {
      this.socket.emit('playerMove', {
        roomId: this.roomId,
        position: { x: position.x, y: position.y, z: position.z },
        rotation: { y: rotation.y }
      });
    }
  }

  sendFire(position, direction, side) {
    if (this.socket && this.roomId) {
      this.socket.emit('playerFire', {
        roomId: this.roomId,
        position: { x: position.x, y: position.y, z: position.z },
        direction: { x: direction.x, y: direction.y, z: direction.z },
        side
      });
    }
  }
}
