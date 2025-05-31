const express = require('express');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback')
const nodemailer = require('nodemailer')
const router = express.Router();

// Lấy toàn bộ phòng học (bao gồm tất cả timeslot)
router.get('/rooms', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lấy tất cả timeslot của 1 phòng (theo classId)
router.get('/rooms/:classId', async (req, res) => {
    try {
        const rooms = await Room.find({ classId: req.params.classId });
        if (!rooms.length) return res.status(404).json({ message: 'Room not found' });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cập nhật trạng thái timeslot theo _id
router.put('/rooms/slot/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!room) return res.status(404).json({ message: 'Timeslot not found' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lấy thông tin của sinh viên đặt phòng
router.get('/admin/booking-info', async (req, res) => {
    const { classId, campus, timeSlot, dateVN } = req.query;
    try {
        const booking = await Booking.findOne({
            classId,
            campus,
            timeSlot,
            dateVN,
            status: 'booked',
            isDeleted: false
        });

        if (!booking) return res.status(404).json({ message: 'Chưa có người đặt' });

        res.json({
            fullname: booking.fullname,
            email: booking.email
        });
    } catch (err) {
        console.error('Lỗi khi truy booking:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Gửi mail thông báo hủy
router.post('/admin/send-cancel-email', async (req, res) => {
    const { to, fullname, classId, timeSlot, dateVN, reason } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'huynhbuingockhoa@gmail.com',
                pass: 'ukre qcve rvwa uvtw'
            }
        });

        const mailOptions = {
            from: 'huynhbuingockhoa@gmail.com',
            to,
            subject: `Thông báo ${reason} đặt phòng`,
            text: `Xin chào ${fullname},\n\nLịch đặt phòng ${classId} vào ${timeSlot}, ngày ${dateVN} đã bị ${reason} bởi admin.\n\nTrân trọng,\nHCMUT SMSR`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Lỗi gửi mail:', err);
        res.status(500).json({ error: 'Gửi email thất bại' });
    }
});

// Lấy tất cả feedbacks
router.get('/admin/feedbacks', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 }); // Mới nhất lên đầu
        res.json(feedbacks);
    } catch (err) {
        console.error('❌ Lỗi khi lấy feedback:', err);
        res.status(500).json({ error: 'Lỗi server khi lấy phản hồi.' });
    }
});

// Admin phản hồi lại feedback
router.put('/admin/feedbacks/:id/reply', async (req, res) => {
    const { id } = req.params;
    const { adminReply } = req.body;

    try {
        const updated = await Feedback.findByIdAndUpdate(
            id,
            { adminReply },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Feedback không tồn tại' });
        }
        res.json({ success: true, message: 'Phản hồi đã được cập nhật.' });
    } catch (err) {
        console.error('❌ Lỗi khi cập nhật phản hồi:', err);
        res.status(500).json({ error: 'Lỗi server khi phản hồi.' });
    }
});

// router.put('/admin/reset-room-status', async (req, res) => {
//     try {
//         const result = await Room.updateMany({}, { $set: { status: 'Available' } });
//         res.json({ message: `Đã cập nhật ${result.modifiedCount} phòng.` });
//     } catch (err) {
//         res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái phòng.' });
//     }
// });


module.exports = router;