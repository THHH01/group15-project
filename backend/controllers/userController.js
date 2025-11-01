const bcrypt = require('bcryptjs');
const User = require('../models/User');

// GET /users - trả về danh sách người dùng (ẩn mật khẩu)
const getUsers = async (_req, res) => {
  try {
    const danhSach = await User.find().select('-matKhau').sort('-createdAt');
    return res.status(200).json({
      thongBao: 'Lấy danh sách người dùng thành công',
      danhSach
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách người dùng:', error);
    return res.status(500).json({ thongBao: 'Không thể lấy danh sách người dùng', chiTiet: error.message });
  }
};

// POST /users - thêm người dùng mới (sử dụng cho mục đích quản trị)
const addUser = async (req, res) => {
  try {
    const { hoTen, email, matKhau, vaiTro } = req.body;

    if (!hoTen || !email || !matKhau) {
      return res.status(400).json({ thongBao: 'Vui lòng nhập họ tên, email và mật khẩu.' });
    }

    const tonTai = await User.findOne({ email: email.toLowerCase() });
    if (tonTai) {
      return res.status(409).json({ thongBao: 'Email đã tồn tại.' });
    }

    const matKhauMaHoa = await bcrypt.hash(matKhau, 10);

    const nguoiDung = new User({ hoTen, email, matKhau: matKhauMaHoa, vaiTro: vaiTro || 'user' });
    await nguoiDung.save();

    return res.status(201).json({ thongBao: 'Thêm người dùng thành công', nguoiDung: nguoiDung.toJSON() });
  } catch (error) {
    console.error('Lỗi thêm người dùng:', error);
    return res.status(500).json({ thongBao: 'Không thể thêm người dùng', chiTiet: error.message });
  }
};

module.exports = { getUsers, addUser };
