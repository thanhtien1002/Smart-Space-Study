const express = require('express');
   const router = express.Router();
   const Feedback = require('../models/Feedback');
   const jwt = require('jsonwebtoken');

   // Middleware xác thực
   const authenticate = (req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1];
     if (!token) return res.status(401).json({ message: 'Không có token' });

     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded;
       next();
     } catch {
       return res.status(401).json({ message: 'Token không hợp lệ' });
     }
   };

   // POST: Gửi đánh giá
   router.post('/', authenticate, async (req, res) => {
     const { bookingId, classId, campus, rating, comment } = req.body;

     try {
       const exists = await Feedback.findOne({ booking: bookingId });
       if (exists) {
         return res.status(400).json({ message: 'Bạn đã đánh giá phòng này rồi' });
       }

       const feedback = new Feedback({
         user: req.user._id,
         booking: bookingId,
         classId,
         campus,
         rating,
         comment
       });

       await feedback.save();
       res.status(201).json({ message: 'Đánh giá thành công' });
     } catch (error) {
       res.status(500).json({ message: 'Lỗi khi gửi đánh giá', error: error.message });
     }
   });

   // GET: Các đánh giá chưa gửi trong 1 ngày
   router.get('/pending', authenticate, async (req, res) => {
     const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

     try {
       const feedbacks = await Feedback.find({ user: req.user._id });
       const bookingsReviewed = feedbacks.map(f => f.booking.toString());

       const CheckLog = require('../models/CheckLog');

       const logs = await CheckLog.find({
         user: req.user._id,
         action: 'checkout',
         timestamp: { $gte: oneDayAgo }
       }).sort({ timestamp: -1 });

       const pending = [];

       for (let log of logs) {
         if (!bookingsReviewed.includes(log.booking.toString())) {
           pending.push({
             bookingId: log.booking,
             classId: log.classId,
             campus: log.campus,
             checkoutTime: log.timestamp
           });
         }
       }

       console.log("Pending feedbacks:", pending);
       res.json(pending);
     } catch (error) {
       console.error("Lỗi khi lấy pending feedbacks:", error);
       res.status(500).json({ message: 'Không thể lấy danh sách chờ đánh giá', error: error.message });
     }
   });

   module.exports = router;