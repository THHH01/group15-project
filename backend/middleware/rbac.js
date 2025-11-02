// Middleware kiểm tra vai trò (role) - Hỗ trợ nhiều roles
const kiemTraVaiTro = (...cacVaiTroChoPhep) => {
  return (req, res, next) => {
    try {
      if (!req.nguoiDung) {
        return res.status(401).json({ thongBao: 'Bạn chưa đăng nhập.' });
      }

      if (!cacVaiTroChoPhep.includes(req.nguoiDung.vaiTro)) {
        return res.status(403).json({ 
          thongBao: `Bạn không có quyền truy cập. Chỉ ${cacVaiTroChoPhep.join(', ')} mới được phép.` 
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({ thongBao: 'Lỗi kiểm tra quyền.', chiTiet: error.message });
    }
  };
};

// Middleware kiểm tra quyền hạn cụ thể
const kiemTraQuyenHan = (...cacQuyenCanThiet) => {
  return async (req, res, next) => {
    try {
      if (!req.nguoiDung) {
        return res.status(401).json({ thongBao: 'Bạn chưa đăng nhập.' });
      }

      const User = require('../models/User');
      const nguoiDung = await User.findById(req.nguoiDung.id);

      if (!nguoiDung) {
        return res.status(404).json({ thongBao: 'Người dùng không tồn tại.' });
      }

      // Admin có tất cả quyền
      if (nguoiDung.vaiTro === 'admin') {
        return next();
      }

      // Kiểm tra từng quyền
      const coTatCaQuyen = cacQuyenCanThiet.every(quyen => nguoiDung.coQuyen(quyen));

      if (!coTatCaQuyen) {
        return res.status(403).json({ 
          thongBao: `Bạn không có đủ quyền. Cần: ${cacQuyenCanThiet.join(', ')}` 
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({ thongBao: 'Lỗi kiểm tra quyền.', chiTiet: error.message });
    }
  };
};

// Middleware kiểm tra trạng thái tài khoản
const kiemTraTrangThai = (req, res, next) => {
  return async (req2, res2, next2) => {
    try {
      if (!req2.nguoiDung) {
        return res2.status(401).json({ thongBao: 'Bạn chưa đăng nhập.' });
      }

      const User = require('../models/User');
      const nguoiDung = await User.findById(req2.nguoiDung.id);

      if (!nguoiDung) {
        return res2.status(404).json({ thongBao: 'Người dùng không tồn tại.' });
      }

      if (nguoiDung.trangThai === 'banned') {
        return res2.status(403).json({ 
          thongBao: 'Tài khoản của bạn đã bị cấm. Vui lòng liên hệ quản trị viên.' 
        });
      }

      if (nguoiDung.trangThai === 'suspended') {
        return res2.status(403).json({ 
          thongBao: 'Tài khoản của bạn đang bị tạm khóa. Vui lòng liên hệ quản trị viên.' 
        });
      }

      return next2();
    } catch (error) {
      return res2.status(500).json({ thongBao: 'Lỗi kiểm tra trạng thái.', chiTiet: error.message });
    }
  };
};

// Middleware kiểm tra quyền Admin (backward compatibility)
const kiemTraAdmin = kiemTraVaiTro('admin');

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
  kiemTraVaiTro,
  kiemTraQuyenHan,
  kiemTraTrangThai,
  kiemTraAdmin,
  kiemTraAdminHoacChuSoHuu
};

