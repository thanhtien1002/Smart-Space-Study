const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  campus: { type: String, required: true },
  classId: { type: String, required: true, unique: true },
  timeSlot: { type: String, required: true },
  status: { type: String, required: true, enum: ['Available', 'Maintenance', 'Booked'] },
  description: { type: String, required: true },
  date:{ type: Date, required: true },
  dateVN: { type: String, required: true }
}, {
  collection: 'rooms'
});

module.exports = mongoose.model('Room', roomSchema);