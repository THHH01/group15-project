// Middleware kiểm tra quyền Admin
const kiemTraAdmin = (req, res, next) => {
  try {
    if (!req.nguoiDung) {
      return res.status(401).json({ thongBao: 'Bạn chưa đăng nhập.' });
    }

    if (req.nguoiDung.vaiTro !== 'admin') {
      return res.status(403).json({ thongBao: 'Bạn không có quyền truy cập. Chỉ Admin mới được phép.' });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ thongBao: 'Lỗi kiểm tra quyền.', chiTiet: error.message });
  }
};

// Middleware kiểm tra quyền Admin hoặc chính user đó
const kiemTraAdminHoacChuSoHuu = (req, res, next) => {
  try {
    if (!req.nguoiDung) {
      return res.status(401).json({ thongBao: 'Bạn chưa đăng nhập.' });
    }

    const { id } = req.params;

    // Admin có thể làm mọi thứ
    if (req.nguoiDung.vaiTro === 'admin') {
      return next();
    }

    // User chỉ được thao tác với chính tài khoản của mình
    if (req.nguoiDung.id === id) {
      return next();
    }

    return res.status(403).json({ 
      thongBao: 'Bạn không có quyền thực hiện thao tác này. Chỉ Admin hoặc chủ tài khoản mới được phép.' 
    });
  } catch (error) {
    return res.status(500).json({ thongBao: 'Lỗi kiểm tra quyền.', chiTiet: error.message });
  }
};

module.exports = {
  kiemTraAdmin,
  kiemTraAdminHoacChuSoHuu
};

