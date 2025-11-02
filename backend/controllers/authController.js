const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { logActivitySimple } = require('../middleware/activityLogger');

const taoPayloadToken = (user) => ({
  id: user._id,
  hoTen: user.hoTen,
  email: user.email,
  vaiTro: user.vaiTro
});

// Tạo Access Token (thời hạn ngắn - 15 phút)
const taoAccessToken = (user) => {
  const biMat = process.env.JWT_SECRET;
  if (!biMat) {
    throw new Error('Thiếu JWT_SECRET trong biến môi trường');
  }

  return jwt.sign(taoPayloadToken(user), biMat, { expiresIn: '15m' });
};

// Tạo Refresh Token (thời hạn dài - 7 ngày)
const taoRefreshToken = async (nguoiDungId, req) => {
  const tokenString = crypto.randomBytes(64).toString('hex');
  
  const thoiGianHetHan = new Date();
  thoiGianHetHan.setDate(thoiGianHetHan.getDate() + 7); // 7 ngày

  const refreshToken = await RefreshToken.create({
    token: tokenString,
    nguoiDungId,
    thoiGianHetHan,
    diaChi: req.ip || req.connection?.remoteAddress || '',
    userAgent: req.get('user-agent') || ''
  });

  return refreshToken.token;
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

    // Ghi log
    await logActivitySimple(req, 'dang_ky', 'thanh_cong', `Đăng ký tài khoản: ${email}`, {
      userId: nguoiDung._id,
      email: nguoiDung.email
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
      // Ghi log đăng nhập thất bại
      await logActivitySimple(req, 'dang_nhap_that_bai', 'that_bai', `Đăng nhập thất bại: Email không tồn tại (${email})`, {
        email,
        reason: 'email_not_found'
      });
      return res.status(401).json({ thongBao: 'Email hoặc mật khẩu không chính xác.' });
    }

    const hopLe = await nguoiDung.kiemTraMatKhau(matKhau);
    if (!hopLe) {
      // Ghi log đăng nhập thất bại
      await logActivitySimple(req, 'dang_nhap_that_bai', 'that_bai', `Đăng nhập thất bại: Sai mật khẩu (${email})`, {
        email,
        userId: nguoiDung._id,
        reason: 'wrong_password'
      });
      return res.status(401).json({ thongBao: 'Email hoặc mật khẩu không chính xác.' });
    }

    // Tạo Access Token và Refresh Token
    const accessToken = taoAccessToken(nguoiDung);
    const refreshToken = await taoRefreshToken(nguoiDung._id, req);

    // Ghi log đăng nhập thành công
    await logActivitySimple(req, 'dang_nhap', 'thanh_cong', `Đăng nhập thành công: ${email}`, {
      userId: nguoiDung._id,
      email: nguoiDung.email
    });

    return res.status(200).json({
      thongBao: 'Đăng nhập thành công!',
      accessToken,
      refreshToken,
      nguoiDung: taoPayloadToken(nguoiDung)
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ thongBao: 'Có lỗi xảy ra khi đăng nhập.', chiTiet: error.message });
  }
};

const dangXuat = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Nếu có refresh token, hủy nó
    if (refreshToken) {
      await RefreshToken.updateOne(
        { token: refreshToken },
        { $set: { daHuy: true } }
      );
    }

    // Nếu có userId từ middleware, hủy tất cả token của user
    if (req.nguoiDung?.id) {
      await RefreshToken.huyTatCaTokenCuaUser(req.nguoiDung.id);
      
      // Ghi log đăng xuất
      await logActivitySimple(req, 'dang_xuat', 'thanh_cong', `Đăng xuất: ${req.nguoiDung.email}`, {
        userId: req.nguoiDung.id,
        email: req.nguoiDung.email
      });
    }

    return res.status(200).json({ 
      thongBao: 'Đăng xuất thành công! Hãy xóa token trên thiết bị của bạn.' 
    });
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    return res.status(500).json({ 
      thongBao: 'Có lỗi xảy ra khi đăng xuất.', 
      chiTiet: error.message 
    });
  }
};

// API làm mới Access Token bằng Refresh Token
const lamMoiToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ thongBao: 'Vui lòng cung cấp refresh token.' });
    }

    // Tìm refresh token trong database
    const tokenRecord = await RefreshToken.findOne({ token: refreshToken });

    if (!tokenRecord) {
      return res.status(401).json({ thongBao: 'Refresh token không hợp lệ.' });
    }

    // Kiểm tra token có còn hiệu lực không
    if (!tokenRecord.conHieuLuc()) {
      return res.status(401).json({ 
        thongBao: 'Refresh token đã hết hạn hoặc bị hủy. Vui lòng đăng nhập lại.' 
      });
    }

    // Lấy thông tin user
    const nguoiDung = await User.findById(tokenRecord.nguoiDungId);
    if (!nguoiDung) {
      return res.status(404).json({ thongBao: 'Người dùng không tồn tại.' });
    }

    // Tạo Access Token mới
    const accessToken = taoAccessToken(nguoiDung);

    // Tùy chọn: tạo refresh token mới (rotation)
    const newRefreshToken = await taoRefreshToken(nguoiDung._id, req);
    
    // Hủy refresh token cũ
    tokenRecord.daHuy = true;
    await tokenRecord.save();

    return res.status(200).json({
      thongBao: 'Làm mới token thành công!',
      accessToken,
      refreshToken: newRefreshToken,
      nguoiDung: taoPayloadToken(nguoiDung)
    });
  } catch (error) {
    console.error('Lỗi làm mới token:', error);
    return res.status(500).json({ 
      thongBao: 'Có lỗi xảy ra khi làm mới token.', 
      chiTiet: error.message 
    });
  }
};

module.exports = {
  dangKy,
  dangNhap,
  dangXuat,
  lamMoiToken
};

