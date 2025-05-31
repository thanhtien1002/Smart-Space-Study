// const mongoose = require('mongoose');
// const Room = require('./models/Room');
// require('dotenv').config(); // Đọc biến môi trường từ .env

// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Login', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(async () => {
//   const rooms = [];

//   for (let i = 25; i <= 27; i++) {
//     rooms.push(new Room({
//       campus: 2,
//       classId: `A${i}01`,
//       timeSlot: '10:00-12:00',
//       status: 'Reserved',
//     }));
//   }

//   await Room.insertMany(rooms);
//   console.log('Đã tạo 3 phòng thành công!');
//   mongoose.connection.close();
// }).catch(err => console.error(err));

// const mongoose = require('mongoose');
// const Room = require('./models/Room');
// require('dotenv').config(); // Đọc biến môi trường từ .env

// async function createRoom() {
//   const campuses = [1, 2]; 
//   const buildings = [
//     'A1','A2','A3','A4','A5','B1', 'B2', 'B3', 'B4','B5','B6', 
//     'B7','B8','B9','B10','B11','C4','C5','C6','H1','H2','H3','H6'
//   ]; 
//   const timeSlots = [
//     "06:00 - 07:50", "08:00 - 09:50", "10:00 - 11:50",
//     "12:00 - 13:50", "14:00 - 15:50", "16:00 - 17:50",
//     "18:00 - 19:50", "20:00 - 21:50"
//   ];
//   const statuses = ["Available", "Maintenance", "Booked"];

//   const sampleRooms = [];

//   for (let i = 1; i <= 500; i++) {
//     const campus = campuses[Math.floor(Math.random() * campuses.length)];
//     const building = buildings[Math.floor(Math.random() * buildings.length)];
//     const roomNumber = Math.floor(Math.random() * 712) + 100;
//     const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
//     const status = statuses[Math.floor(Math.random() * statuses.length)];

//     sampleRooms.push({
//       campus: campus,
//       classId: `${building}-${roomNumber}`,
//       timeSlot: timeSlot,
//       status: status
//     });
//   }

//   try {
//     await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Login', {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     await Room.deleteMany({}); // Xóa sạch trước
//     await Room.insertMany(sampleRooms); // Insert mẫu mới
//     console.log('✅ Đã thêm 500 phòng mẫu vào MongoDB!');

//     mongoose.connection.close(); // Đóng kết nối
//   } catch (err) {
//     console.error('❌ Lỗi khi thêm dữ liệu:', err);
//     mongoose.connection.close(); 
//   }
// }

// createRoom();


// const mongoose = require('mongoose');
// const Room = require('./models/Room');
// require('dotenv').config();

// async function createRoom() {
//   const campuses = [1, 2];
//   const buildings = [
//     'A1','A2','A3','A4','A5','B1', 'B2', 'B3', 'B4','B5','B6',
//     'B7','B8','B9','B10','B11','C4','C5','C6','H1','H2','H3','H6'
//   ];
//   const timeSlots = [
//     "06:00 - 07:50", "08:00 - 09:50", "10:00 - 11:50",
//     "12:00 - 13:50", "14:00 - 15:50", "16:00 - 17:50",
//     "18:00 - 19:50", "20:00 - 21:50"
//   ];
//   const statuses = ["Available", "Maintenance", "Booked"];
//   const descriptions = ["Individual Study", "Group Study", "One-on-One Tutoring"];
//   const sampleRooms = [];

//   for (let i = 1; i <= 500; i++) {
//     const campus = campuses[Math.floor(Math.random() * campuses.length)];
//     const building = buildings[Math.floor(Math.random() * buildings.length)];
//     const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
//     const status = statuses[Math.floor(Math.random() * statuses.length)];
//     const description = descriptions[Math.floor(Math.random() * descriptions.length)];
//     sampleRooms.push({
//       campus: campus,
//       classId: `${building}-${100 + i}`, // Đảm bảo classId duy nhất
//       timeSlot: timeSlot,
//       status: status,
//       description: description
//     });
//   }

//   try {
//     await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Login', {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     await Room.deleteMany({});
//     console.log('Đã xóa dữ liệu cũ');

//     await Room.insertMany(sampleRooms);
//     console.log('✅ Đã thêm 500 phòng mẫu vào MongoDB!');

//     // Kiểm tra số lượng thực tế
//     const count = await Room.countDocuments();
//     console.log(`Số lượng phòng thực tế trong MongoDB: ${count}`);

//     mongoose.connection.close();
//   } catch (err) {
//     console.error('❌ Lỗi khi thêm dữ liệu:', err);
//     mongoose.connection.close();
//   }
// }

// createRoom();


const mongoose = require('mongoose');
const Room = require('./models/Room');
require('dotenv').config();


function getRandomDate(startDate, endDate) {
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();
  const randomTimestamp = startTimestamp + Math.random() * (endTimestamp - startTimestamp);
  return new Date(randomTimestamp);
}

async function createRoom() {
  const campuses = [1, 2];
  const buildings = [
    'A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
    'B7', 'B8', 'B9', 'B10', 'B11', 'C4', 'C5', 'C6', 'H1', 'H2', 'H3', 'H6',
  ];
  const timeSlots = [
    '06:00 - 07:50', '08:00 - 09:50', '10:00 - 11:50',
    '12:00 - 13:50', '14:00 - 15:50', '16:00 - 17:50',
    '18:00 - 19:50', '20:00 - 21:50',
  ];
  const statuses = ['Available', 'Maintenance', 'Booked'];
  const descriptions = ['Individual Study', 'Group Study', 'One-on-One Tutoring'];
  const sampleRooms = [];

  
  const startDate = new Date('2025-04-30');
  const endDate = new Date('2025-12-31');

  for (let i = 1; i <= 500; i++) {
    const campus = campuses[Math.floor(Math.random() * campuses.length)];
    const building = buildings[Math.floor(Math.random() * buildings.length)];
    const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const date = getRandomDate(startDate, endDate); 
    const dateVN = date.toLocaleDateString('vi-VN');
    sampleRooms.push({
      campus: campus,
      classId: `${building}-${100 + i}`, // Đảm bảo classId duy nhất
      timeSlot: timeSlot,
      status: status,
      description: description,
      date: date,
      dateVN: dateVN 
    });
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Login', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Room.deleteMany({});
    console.log('Đã xóa dữ liệu cũ');

    await Room.insertMany(sampleRooms);
    console.log('✅ Đã thêm 500 phòng mẫu vào MongoDB!');

    // Kiểm tra số lượng thực tế
    const count = await Room.countDocuments();
    console.log(`Số lượng phòng thực tế trong MongoDB: ${count}`);

    // Kiểm tra một bản ghi mẫu để xem trường date
    const sampleRecord = await Room.findOne();
    console.log('Bản ghi mẫu:', sampleRecord);

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Lỗi khi thêm dữ liệu:', err);
    mongoose.connection.close();
  }
}

createRoom();