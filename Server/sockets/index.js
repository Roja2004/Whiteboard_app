const Room = require('../models/Room');

// In-memory user tracking
const roomUsers = {}; // { roomId: Set<socket.id> }
const userCursors = {}; // { roomId: { userId: {x, y, color} } }

module.exports = function(server) {
  const io = require('socket.io')(server, {
    cors: { origin: '*' }
  });

  // Socket.io connection
  io.on('connection', (socket) => {
    let currentRoom = null;

    // Join room
    socket.on('join-room', async ({ roomId }) => {
      currentRoom = roomId;
      socket.join(roomId);

      roomUsers[roomId] = roomUsers[roomId] || new Set();
      roomUsers[roomId].add(socket.id);

      // Send user count
      io.to(roomId).emit('user-count', roomUsers[roomId].size);

      // Load and send drawing data
      const room = await Room.findOne({ roomId });
      if (room) {
        socket.emit('drawing-data', room.drawingData);
      }
    });

    // Leave room
    socket.on('leave-room', ({ roomId }) => {
      if (roomUsers[roomId]) {
        roomUsers[roomId].delete(socket.id);
        io.to(roomId).emit('user-count', roomUsers[roomId].size);
      }
      socket.leave(roomId);
    });

    // Drawing events
    ['draw-start', 'draw-move', 'draw-end'].forEach(event => {
      socket.on(event, async ({ roomId, cmd }) => {
        // Broadcast to others
        socket.to(roomId).emit(event, cmd);

        // Persist drawing data
        const room = await Room.findOne({ roomId });
        if (room) {
          room.drawingData.push(cmd);
          room.lastActivity = Date.now();
          // Limit stored history if needed
          if (room.drawingData.length > 5000) room.drawingData = room.drawingData.slice(-5000);
          await room.save();
        }
      });
    });

    // Clear canvas
    socket.on('clear-canvas', async ({ roomId }) => {
      io.to(roomId).emit('clear-canvas', { type: 'clear', timestamp: Date.now() });
      // Persist clear
      const room = await Room.findOne({ roomId });
      if (room) {
        room.drawingData.push({ type: 'clear', timestamp: Date.now() });
        await room.save();
      }
    });

    // Cursor move handling (throttle client-side)
    socket.on('cursor-move', ({ roomId, x, y }) => {
      userCursors[roomId] = userCursors[roomId] || {};
      userCursors[roomId][socket.id] = { x, y, color: 'orange' }; // Assign color if needed
      io.to(roomId).emit('cursor-update', userCursors[roomId]);
    });

    // Get drawing (initial load)
    socket.on('get-drawing', async ({ roomId }) => {
      const room = await Room.findOne({ roomId });
      if (room) {
        socket.emit('drawing-data', room.drawingData);
      }
    });

    // On disconnect
    socket.on('disconnect', () => {
      if (currentRoom && roomUsers[currentRoom]) {
        roomUsers[currentRoom].delete(socket.id);
        io.to(currentRoom).emit('user-count', roomUsers[currentRoom].size);
      }
      if (currentRoom && userCursors[currentRoom]) {
        delete userCursors[currentRoom][socket.id];
        io.to(currentRoom).emit('cursor-update', userCursors[currentRoom]);
      }
    });
  });

  // Periodic room cleanup (inactive > 24h)
  setInterval(async () => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    await Room.deleteMany({ lastActivity: { $lt: cutoff } });
  }, 60 * 60 * 1000); // every hour
};