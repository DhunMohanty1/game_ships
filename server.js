import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Keep track of rooms and players
// rooms[roomId] = { players: { socketId: { id, position, rotation } } }
const rooms = {};

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('createRoom', (callback) => {
    // Generate a simple 4-letter room code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let roomId = '';
    for (let i = 0; i < 4; i++) {
      roomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    rooms[roomId] = { players: {} };
    socket.join(roomId);
    
    // Add host to room
    rooms[roomId].players[socket.id] = {
      id: socket.id,
      position: { x: 0, y: 1.0, z: -18 },
      rotation: { y: 0 },
      team: 'red'
    };
    
    console.log(`Room created: ${roomId} by ${socket.id}`);
    callback({ success: true, roomId, team: 'red' });
  });

  socket.on('joinRoom', (roomId, callback) => {
    roomId = roomId.toUpperCase();
    if (rooms[roomId]) {
      socket.join(roomId);
      
      // Assign alternating teams based on current player count
      const playerCount = Object.keys(rooms[roomId].players).length;
      const team = (playerCount % 2 === 0) ? 'red' : 'blue';

      rooms[roomId].players[socket.id] = {
        id: socket.id,
        position: { x: 0, y: 1.0, z: -18 },
        rotation: { y: 0 },
        team: team
      };
      
      console.log(`Player ${socket.id} joined room: ${roomId} on team ${team}`);
      
      // Send current players to the new player
      callback({ success: true, roomId, players: rooms[roomId].players, team: team });
      
      // Notify others in the room
      socket.to(roomId).emit('playerJoined', rooms[roomId].players[socket.id]);
    } else {
      callback({ success: false, message: 'Room not found' });
    }
  });

  socket.on('playerMove', (data) => {
    const { roomId, position, rotation, shipClass } = data;
    if (roomId && rooms[roomId] && rooms[roomId].players[socket.id]) {
      rooms[roomId].players[socket.id].position = position;
      rooms[roomId].players[socket.id].rotation = rotation;
      if (shipClass) rooms[roomId].players[socket.id].shipClass = shipClass;
      
      // Broadcast to others in the room
      socket.to(roomId).emit('playerMoved', {
        id: socket.id,
        position,
        rotation,
        shipClass: rooms[roomId].players[socket.id].shipClass
      });
    }
  });

  socket.on('playerFire', (data) => {
    const { roomId, position, direction, side } = data;
    if (roomId && rooms[roomId]) {
      socket.to(roomId).emit('playerFired', {
        id: socket.id,
        position,
        direction,
        side
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    // Clean up player from rooms
    for (const roomId in rooms) {
      if (rooms[roomId].players[socket.id]) {
        delete rooms[roomId].players[socket.id];
        io.to(roomId).emit('playerLeft', socket.id);
        
        // Clean up empty rooms
        if (Object.keys(rooms[roomId].players).length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted (empty)`);
        }
        break; // A socket is only in one room at a time in this flow
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
