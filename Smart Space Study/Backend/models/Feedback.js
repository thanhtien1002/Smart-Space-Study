const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  classId: { type: String, required: true },
  campus: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
  adminReply: { type: String, default: 'No response' },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'feedbacks'
});

module.exports = mongoose.model('Feedback', feedbackSchema);