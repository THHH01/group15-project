const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const passwordRoutes = require('./routes/password');
const uploadRoutes = require('./routes/upload');
const roleRoutes = require('./routes/role');
const logRoutes = require('./routes/log');

require('dotenv').config();
const app = express();
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const cors = require('cors');
app.use(cors());

// Kết nối MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Kết nối MongoDB thành công!'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/logs', logRoutes);

app.get('/', (_req, res) => {
  res.json({ 
    thongBao: 'API hoạt động.', 
    endpoints: [
      '/api/auth - Đăng ký, đăng nhập, đăng xuất, refresh token',
      '/api/users - Quản lý user (Admin)',
      '/api/profile - Xem & cập nhật profile',
      '/api/password - Quên mật khẩu, đặt lại mật khẩu',
      '/api/upload - Upload avatar',
      '/api/roles - Quản lý vai trò & quyền hạn (Admin/Moderator)',
      '/api/logs - Quản lý activity logs & thống kê (Admin/Moderator)'
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));