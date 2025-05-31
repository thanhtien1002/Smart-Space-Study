const mongoose = require('mongoose');
const Account = require('./models/Account'); // Import model Account từ thư mục models
require('dotenv').config(); // Đọc biến môi trường từ .env

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Login', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  try {
    const newAccount = new Account({
      username: 'admin3',
      password: 'admin1234',
      Name: 'Admin9',
      MSSV: '2213417',
      SDT: '0999999999',
      Class: 'MT22KT07',
      role: 'admin',
      email: 'khoahuynhbuingoc@gmail.com',
    });

    await newAccount.save();
    console.log('Đã tạo tài khoản thành công cho username:', newAccount.username);
  } catch (err) {
    console.error('Lỗi khi tạo tài khoản:', err.message);
  } finally {
    mongoose.connection.close();
  }
}).catch(err => {
  console.error('Lỗi kết nối MongoDB:', err.message);
  mongoose.connection.close();
});