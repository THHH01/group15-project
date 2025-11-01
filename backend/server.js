const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

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

app.get('/', (_req, res) => {
  res.json({ thongBao: 'API hoạt động. Vui lòng sử dụng các endpoint /api/auth và /api/users.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));