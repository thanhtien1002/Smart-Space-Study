const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const CheckLog = require('../models/CheckLog');
const Room = require('../models/Room');
const jwt = require('jsonwebtoken');

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Không tìm thấy token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// GET: Lấy danh sách booking
router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({
      account: req.user._id,
      isDeleted: { $ne: true },
    }).sort({ date: -1, timeSlot: 1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách đặt chỗ', error: error.message });
  }
});

// POST: Check-in hoặc Check-out (ghi vào CheckLog)
router.post('/:id/checkin-checkout', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  if (!['checkin', 'checkout'].includes(action)) {
    return res.status(400).json({ message: 'Hành động không hợp lệ' });
  }

  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đặt chỗ' });

    if (booking.account.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Bạn không có quyền với đặt chỗ này' });
    }

    const existingLogs = await CheckLog.find({ booking: id }).sort({ timestamp: -1 });

    if (action === 'checkin') {
      if (existingLogs.length > 0) {
        return res.status(400).json({
          message: existingLogs[0].action === 'checkin'
            ? 'Đã check-in, không thể check-in lại'
            : 'Đã check-out, không thể check-in'
        });
      }
    } else if (action === 'checkout') {
      if (existingLogs.length === 0 || existingLogs[0].action !== 'checkin') {
        return res.status(400).json({ message: 'Chưa check-in, không thể check-out' });
      }
    }

    const log = new CheckLog({
      user: req.user._id,
      booking: id,
      action,
      timestamp: new Date(),
      fullname: booking.fullname,
      classId: booking.classId,
      campus: booking.campus,
    });

    await log.save();

    if (action === 'checkout') {
      // Xóa đặt chỗ khỏi MongoDB
      await Booking.findByIdAndDelete(id);

      // Cập nhật trạng thái phòng về "Available"
      await Room.findOneAndUpdate(
        {
          classId: booking.classId,
          timeSlot: booking.timeSlot,
          dateVN: booking.dateVN,
          campus: booking.campus
        },
        { status: 'Available' }
      );

    }

    res.status(200).json({
      message: `✅ ${action === 'checkin' ? 'Check-in' : 'Check-out'} thành công`,
      log,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thực hiện hành động', error: error.message });
  }
});

module.exports = router;
