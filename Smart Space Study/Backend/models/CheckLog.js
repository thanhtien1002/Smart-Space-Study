const mongoose = require('mongoose');

const checkLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  action: { type: String, enum: ['checkin', 'checkout'], required: true },
  timestamp: { type: Date, default: Date.now },
  fullname: { type: String, required: true },     // Họ tên người dùng
  classId: { type: String, required: true },       // Mã phòng
  campus: { type: String, required: true },        // Cơ sở
});

module.exports = mongoose.model('CheckLog', checkLogSchema);
