const express = require('express');
const {
  capNhatVaiTro,
  capNhatTrangThai,
  capNhatQuyenHan,
  layDanhSachTheoVaiTro,
  thongKeTheoVaiTro
} = require('../controllers/roleController');
const { xacThucToken } = require('../middleware/auth');
const { kiemTraVaiTro, kiemTraQuyenHan } = require('../middleware/rbac');

const router = express.Router();

// Lấy danh sách users theo role/status (Admin, Moderator)
router.get(
  '/',
  xacThucToken,
  kiemTraVaiTro('admin', 'moderator'),
  layDanhSachTheoVaiTro
);

// Lấy thống kê (Admin, Moderator)
router.get(
  '/thong-ke',
  xacThucToken,
  kiemTraVaiTro('admin', 'moderator'),
  thongKeTheoVaiTro
);

// Cập nhật vai trò (Admin only)
router.put(
  '/:id/vai-tro',
  xacThucToken,
  kiemTraVaiTro('admin'),
  capNhatVaiTro
);

// Cập nhật trạng thái (Admin, Moderator với giới hạn)
router.put(
  '/:id/trang-thai',
  xacThucToken,
  kiemTraVaiTro('admin', 'moderator'),
  capNhatTrangThai
);

// Cập nhật quyền hạn (Admin only)
router.put(
  '/:id/quyen-han',
  xacThucToken,
  kiemTraVaiTro('admin'),
  capNhatQuyenHan
);

module.exports = router;

