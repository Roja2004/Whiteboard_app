const mongoose = require('mongoose');

// Room schema: unique roomId, timestamps, drawingData array
const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  drawingData: { type: Array, default: [] }
});

module.exports = mongoose.model('Room', RoomSchema);