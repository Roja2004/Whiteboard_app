const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// POST /api/rooms/join - join or create room
router.post('/join', async (req, res) => {
  const { roomId } = req.body;
  if (!roomId || !/^[a-zA-Z0-9]{6,8}$/.test(roomId)) {
    return res.status(400).json({ error: 'Invalid room code' });
  }
  let room = await Room.findOne({ roomId });
  if (!room) {
    room = await Room.create({ roomId });
  } else {
    room.lastActivity = Date.now();
    await room.save();
  }
  res.json({ roomId: room.roomId, createdAt: room.createdAt });
});

// GET /api/rooms/:roomId - get room info
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findOne({ roomId });
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

module.exports = router;