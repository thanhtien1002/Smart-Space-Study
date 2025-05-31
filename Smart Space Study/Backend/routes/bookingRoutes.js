const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Account = require('../models/Account');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Middleware kiểm tra token (chỉ dùng JWT)
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

// API tạo đặt chỗ + cập nhật trạng thái phòng (gộp vào 1 transaction)
router.post('/', authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingData = {
      account: req.user._id,
      campus: req.body.campus,
      classId: req.body.classId,
      timeSlot: req.body.timeSlot,
      fullname: req.body.fullname,
      mssv: req.body.mssv,
      email: req.body.email,
      phonenumber: req.body.phonenumber,
      className: req.body.className,
      status: req.body.status || 'booked',
      description: req.body.description,
      date: req.body.date,
      dateVN: req.body.dateVN
    };

    const newBooking = new Booking(bookingData);
    await newBooking.save({ session });

    const room = await Room.findOne({
      classId: req.body.classId,
      campus: req.body.campus,
      timeSlot: req.body.timeSlot,
      description: req.body.description,
      date: req.body.date,
      dateVN: req.body.dateVN
    }).session(session);

    if (!room) {
      throw new Error('Không tìm thấy phòng để cập nhật trạng thái');
    }

    // room.status = 'Reserved';
    room.status = 'Booked';
    await room.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Đặt chỗ thành công', booking: newBooking });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Lỗi khi tạo đặt chỗ:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo đặt chỗ' });
  }
});

// API lấy danh sách đặt chỗ của người dùng
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ account: req.user._id })
      .populate('account', 'username Name MSSV email');
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đặt chỗ:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách đặt chỗ' });
  }
});

// API xóa đặt chỗ
router.delete('/:id', authenticateToken, async (req, res) => {
  const bookingId = req.params.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy thông tin đặt chỗ' });
    }

    if (booking.account.toString() !== req.user._id && req.user.role !== 'admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền xóa đặt chỗ này' });
    }

    console.log('🧾 Booking bị xóa:', {
      classId: booking.classId,
      campus: booking.campus,
      timeSlot: booking.timeSlot,
    });

    // Xóa đặt chỗ
    await Booking.findByIdAndDelete(bookingId).session(session);

    const updatedRoom = await Room.findOneAndUpdate(
      {
        classId: booking.classId,
        campus: booking.campus,
        timeSlot: booking.timeSlot,
      },
      { status: 'Available' },
      { session, new: true }
    );

    if (updatedRoom) {
      console.log(`✅ Đã cập nhật trạng thái phòng ${updatedRoom.classId} thành Available`);
    } else {
      console.warn(`⚠️ Không tìm thấy phòng để cập nhật trạng thái`);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Xóa đặt chỗ thành công' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Lỗi khi xóa đặt chỗ:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa đặt chỗ' });
  }
});

router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const { excludeDeleted } = req.query;
    const query = excludeDeleted ? { isDeleted: { $ne: true } } : {};
    if (req.user.role !== 'admin') {
      query.account = req.user._id; // Chỉ cho phép người dùng xem bookings của họ
    }
    const bookings = await Booking.find(query).populate('account', 'username Name MSSV email');
    res.json(bookings);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách đặt chỗ:', err);
    res.status(500).json({ message: err.message });
  }
});
// API lấy danh sách phòng trống để chuyển lớp
router.get('/available-classes', authenticateToken, async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'Available' });
    res.json(rooms);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách phòng trống:', err);
    res.status(500).json({ message: err.message });
  }
});
// API chuyển lớp
router.post('/transfer-class', authenticateToken, async (req, res) => {
  const { bookingId, newRoomId } = req.body;

  // Kiểm tra tham số đầu vào
  if (!newRoomId || typeof newRoomId !== 'string') {
    return res.status(400).json({ message: 'newRoomId không hợp lệ, phải là chuỗi' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Tìm booking
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy đặt chỗ' });
    }

    // Kiểm tra trạng thái isDeleted
    if (booking.isDeleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Đặt chỗ đã bị xóa, không thể chuyển lớp' });
    }

    // Kiểm tra quyền truy cập
    if (booking.account.toString() !== req.user._id && req.user.role !== 'admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền chuyển lớp này' });
    }

    // Tìm phòng mới bằng _id
    const newRoom = await Room.findById(newRoomId).session(session);
    if (!newRoom) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy phòng mới với newRoomId: ' + newRoomId });
    }

    // Kiểm tra trạng thái phòng mới
    if (newRoom.status !== 'Available') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Phòng mới không trống' });
    }

    // Tìm phòng cũ
    const oldRoom = await Room.findOne({
      classId: booking.classId,
      campus: booking.campus,
      timeSlot: booking.timeSlot,
      date: booking.date,
    }).session(session);

    if (!oldRoom) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy phòng cũ' });
    }

    // Cập nhật thông tin đặt chỗ dựa trên thông tin của phòng mới
    booking.classId = newRoom.classId;
    booking.timeSlot = newRoom.timeSlot;
    booking.date = newRoom.date;
    booking.status = 'transferred';

    // Cập nhật trạng thái phòng mới và phòng cũ
    newRoom.status = 'Booked';
    oldRoom.status = 'Available';

    // Lưu thay đổi
    await newRoom.save({ session });
    await oldRoom.save({ session });
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Chuyển lớp thành công. Vui lòng xác nhận để hoàn tất.',
      booking: {
        _id: booking._id,
        classId: booking.classId,
        timeSlot: booking.timeSlot,
        campus: booking.campus,
        status: booking.status,
        fullname: booking.fullname,
        date: booking.date,
        dateVN: booking.dateVN,
        description: booking.description,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Lỗi khi chuyển lớp:', err);
    res.status(500).json({ message: err.message });
  }
});
// API xác nhận chuyển lớp
router.post('/confirm-transfer', authenticateToken, async (req, res) => {
  const { bookingId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy đặt chỗ' });
    }

    // Kiểm tra trạng thái isDeleted
    if (booking.isDeleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Đặt chỗ đã bị xóa, không thể xác nhận chuyển lớp' });
    }

    if (booking.account.toString() !== req.user._id && req.user.role !== 'admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền xác nhận chuyển lớp này' });
    }

    if (booking.status !== 'transferred') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Đặt chỗ không ở trạng thái transferred' });
    }

    booking.status = 'booked';
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Xác nhận chuyển lớp thành công. Đặt chỗ đã được hoàn tất.',
      booking: {
        _id: booking._id,
        classId: booking.classId,
        timeSlot: booking.timeSlot,
        campus: booking.campus,
        status: booking.status,
        fullname: booking.fullname,
        date: booking.date,
        dateVN: booking.dateVN,
        description: booking.description,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Lỗi khi xác nhận chuyển lớp:', err);
    res.status(500).json({ message: err.message });
  }
});
// API hủy đặt chỗ
router.post('/cancel-booking', authenticateToken, async (req, res) => {
  const { bookingId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Tìm booking
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy đặt chỗ' });
    }

    // Kiểm tra trạng thái isDeleted
    if (booking.isDeleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Đặt chỗ đã bị xóa, không thể hủy' });
    }

    // Kiểm tra quyền truy cập
    if (booking.account.toString() !== req.user._id && req.user.role !== 'admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền hủy đặt chỗ này' });
    }

    // Tìm phòng tương ứng
    const room = await Room.findOne({
      classId: booking.classId,
      campus: booking.campus,
      timeSlot: booking.timeSlot,
      date: booking.date,
    }).session(session);

    if (!room) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    // Cập nhật trạng thái booking và phòng
    booking.status = 'cancelled';
    room.status = 'Available';

    // Lưu thay đổi
    await room.save({ session });
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Hủy đặt chỗ thành công',
      booking: {
        _id: booking._id,
        classId: booking.classId,
        timeSlot: booking.timeSlot,
        campus: booking.campus,
        status: booking.status,
        fullname: booking.fullname,
        isDeleted: booking.isDeleted,
        date: booking.date,
        dateVN: booking.dateVN,
        description: booking.description,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Lỗi khi hủy đặt chỗ:', err);
    res.status(500).json({ message: err.message });
  }
});
// API xác nhận hủy đặt chỗ
router.post('/confirm-cancel', authenticateToken, async (req, res) => {
  const { bookingId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy đặt chỗ' });
    }

    if (booking.account.toString() !== req.user._id && req.user.role !== 'admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền xác nhận hủy đặt chỗ này' });
    }

    if (booking.status !== 'cancelled') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Đặt chỗ không ở trạng thái cancelled' });
    }

    booking.isDeleted = true;
    booking.deletedAt = new Date();
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Xác nhận hủy đặt chỗ thành công',
      booking: {
        _id: booking._id,
        classId: booking.classId,
        timeSlot: booking.timeSlot,
        campus: booking.campus,
        status: booking.status,
        fullname: booking.fullname,
        isDeleted: booking.isDeleted,
        date: booking.date,
        dateVN: booking.dateVN,
        description: booking.description,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Lỗi khi xác nhận hủy đặt chỗ:', err);
    res.status(500).json({ message: err.message });
  }
});

// API hoàn tác hủy đặt chỗ
router.post('/undo-cancel', authenticateToken, async (req, res) => {
  const { bookingId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy đặt chỗ' });
    }

    if (booking.account.toString() !== req.user._id && req.user.role !== 'admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền hoàn tác hủy đặt chỗ này' });
    }

    if (booking.status !== 'cancelled') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Đặt chỗ không ở trạng thái cancelled' });
    }

    // Tìm phòng hiện tại
    const currentRoom = await Room.findOne({
      classId: booking.classId,
      campus: booking.campus,
      timeSlot: booking.timeSlot,
      date: booking.date,
    }).session(session);

    if (!currentRoom) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy phòng hiện tại' });
    }

    // Kiểm tra xem có booking nào khác đang sử dụng phòng này không
    const existingBooking = await Booking.findOne({
      classId: currentRoom.classId,
      campus: currentRoom.campus,
      timeSlot: currentRoom.timeSlot,
      date: currentRoom.date,
      status: 'booked',
      _id: { $ne: booking._id } // Loại trừ booking hiện tại
    }).session(session);

    if (existingBooking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Phòng đã được đặt bởi booking khác, không thể hoàn tác' });
    }

    // Cập nhật trạng thái booking và phòng
    booking.status = 'booked';
    booking.isDeleted = false;
    currentRoom.status = 'Booked';

    await currentRoom.save({ session });
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Hoàn tác hủy đặt chỗ thành công. Đặt chỗ đã được khôi phục.',
      booking: {
        _id: booking._id,
        classId: booking.classId,
        timeSlot: booking.timeSlot,
        campus: booking.campus,
        status: booking.status,
        fullname: booking.fullname,
        date: booking.date,
        dateVN: booking.dateVN,
        description: booking.description,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Lỗi khi hoàn tác hủy đặt chỗ:', err);
    res.status(500).json({ message: err.message });
  }
});

// API đánh dấu đặt chỗ là đã xóa
router.patch('/bookings/:id', authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy đặt chỗ' });
    }

    if (booking.account.toString() !== req.user._id && req.user.role !== 'admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền xóa đặt chỗ này' });
    }

    // Kiểm tra trạng thái isDeleted
    if (booking.isDeleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Đặt chỗ đã bị xóa trước đó' });
    }

    // Tìm phòng tương ứng
    const room = await Room.findOne({
      classId: booking.classId,
      campus: booking.campus,
      timeSlot: booking.timeSlot,
      date: booking.date,
    }).session(session);

    if (!room) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    // Cập nhật trạng thái phòng về Available
    room.status = 'Available';
    await room.save({ session });

    // Đánh dấu booking là đã xóa
    booking.isDeleted = true;
    booking.deletedAt = new Date();
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Đặt chỗ đã được đánh dấu là xóa và phòng đã được cập nhật về trạng thái Available',
      booking,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Lỗi khi đánh dấu xóa đặt chỗ:', err);
    res.status(500).json({ message: err.message });
  }
});



// GET /booking/getNotification/:username
router.get('/getNotification/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Tìm account theo username
    const account = await Account.findOne({ username });

    if (!account) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    // Lấy tất cả booking liên quan có các status cần thiết
    const bookings = await Booking.find({
      account: account._id,
      status: { $in: ['booked', 'cancelled', 'transferred'] }
    }).sort({ updatedAt: -1 }); // sắp xếp mới nhất trước

    // Tạo danh sách thông báo
    const notifications = bookings.map(booking => {
      let content = '';

      switch (booking.status) {
        case 'booked':
          content = `Bạn đã đặt chỗ phòng ${booking.classId} : ${booking.timeSlot} thành công.`;
          break;
        case 'cancelled':
          content = `Bạn đã hủy chỗ phòng ${booking.classId} : ${booking.timeSlot}.`;
          break;
        case 'transferred':
          content = `Bạn đã chuyển từ phòng ${booking.classId} : ${booking.timeSlot} sang ${booking.classId} : ${booking.timeSlot}.`;
          break;
        default:
          content = `Cập nhật mới về phòng ${booking.classId} : ${booking.timeSlot}.`;
      }

      return {
        content,
        createdAt: booking.updatedAt, // để frontend có thể hiển thị thời gian nếu cần
      };
    });

    res.json(notifications);
  } catch (error) {
    console.error('Lỗi khi lấy thông báo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


module.exports = router;
