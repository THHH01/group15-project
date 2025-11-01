const jwt = require('jsonwebtoken');

const xacThucToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ thongBao: 'Không tìm thấy token xác thực. Vui lòng đăng nhập.' });
    }

    const token = authHeader.substring(7);
    const biMat = process.env.JWT_SECRET;

    if (!biMat) {
      return res.status(500).json({ thongBao: 'Lỗi cấu hình máy chủ.' });
    }

    const decoded = jwt.verify(token, biMat);
    req.nguoiDung = decoded;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ thongBao: 'Token không hợp lệ.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ thongBao: 'Token đã hết hạn. Vui lòng đăng nhập lại.' });
    }
    return res.status(500).json({ thongBao: 'Lỗi xác thực.', chiTiet: error.message });
  }
};

module.exports = { xacThucToken };

