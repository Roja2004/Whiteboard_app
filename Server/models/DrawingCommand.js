// For reference, not a collection (embedded in Room)
const DrawingCommandSchema = {
  type: String, // 'stroke' or 'clear'
  data: Object, // { path, color, width }
  timestamp: Date
};

module.exports = DrawingCommandSchema;