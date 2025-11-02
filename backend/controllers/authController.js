const jwt = require('jsonwebtoken');
const User = require('../models/User');

const taoPayloadToken = (user) => ({
  id: user._id,
  hoTen: user.hoTen,
  email: user.email,
  vaiTro: user.vaiTro
});

const taoToken = (user) => {
  const biMat = process.env.JWT_SECRET;
  if (!biMat) {
    throw new Error('Thiếu JWT_SECRET trong biến môi trường');
  }

  return jwt.sign(taoPayloadToken(user), biMat, { expiresIn: '1h' });
};

const dangKy = async (req, res) => {
  try {
    const { hoTen, email, matKhau, vaiTro } = req.body;

    if (!hoTen || !email || !matKhau) {
      return res.status(400).json({ thongBao: 'Vui lòng cung cấp đầy đủ họ tên, email và mật khẩu.' });
    }

    const emailDaTonTai = await User.findOne({ email: email.toLowerCase() });
    if (emailDaTonTai) {
      return res.status(409).json({ thongBao: 'Email đã tồn tại. Vui lòng chọn email khác.' });
    }

    const nguoiDung = await User.create({
      hoTen,
      email,
      matKhau,
      vaiTro: vaiTro === 'admin' ? 'admin' : 'user'
    });

    return res.status(201).json({
      thongBao: 'Đăng ký thành công!',
      nguoiDung: nguoiDung.toJSON()
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    return res.status(500).json({ thongBao: 'Có lỗi xảy ra khi đăng ký.', chiTiet: error.message });
  }
};

const dangNhap = async (req, res) => {
  try {
    const { email, matKhau } = req.body;

    if (!email || !matKhau) {
      return res.status(400).json({ thongBao: 'Vui lòng cung cấp email và mật khẩu.' });
    }

    const nguoiDung = await User.findOne({ email: email.toLowerCase() });
    if (!nguoiDung) {
      return res.status(401).json({ thongBao: 'Email hoặc mật khẩu không chính xác.' });
    }

    const hopLe = await nguoiDung.kiemTraMatKhau(matKhau);
    if (!hopLe) {
      return res.status(401).json({ thongBao: 'Email hoặc mật khẩu không chính xác.' });
    }

    const token = taoToken(nguoiDung);

    return res.status(200).json({
      thongBao: 'Đăng nhập thành công!',
      token,
      nguoiDung: taoPayloadToken(nguoiDung)
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ thongBao: 'Có lỗi xảy ra khi đăng nhập.', chiTiet: error.message });
  }
};

const dangXuat = async (_req, res) => {
  return res.status(200).json({ thongBao: 'Đăng xuất thành công! Hãy xóa token trên thiết bị của bạn.' });
};

module.exports = {
  dangKy,
  dangNhap,
  dangXuat
};

