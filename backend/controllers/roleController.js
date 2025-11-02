const User = require('../models/User');

// Cập nhật vai trò user (Admin only)
const capNhatVaiTro = async (req, res) => {
  try {
    const { id } = req.params;
    const { vaiTro } = req.body;

    if (!vaiTro || !['user', 'moderator', 'admin'].includes(vaiTro)) {
      return res.status(400).json({ 
        thongBao: 'Vai trò không hợp lệ. Chỉ chấp nhận: user, moderator, admin' 
      });
    }

    const nguoiDung = await User.findById(id);
    if (!nguoiDung) {
      return res.status(404).json({ thongBao: 'Người dùng không tồn tại.' });
    }

    // Cập nhật vai trò và quyền hạn mặc định
    nguoiDung.vaiTro = vaiTro;
    nguoiDung.quyenHan = User.layQuyenMacDinh(vaiTro);
    await nguoiDung.save();

    return res.status(200).json({
      thongBao: `Đã cập nhật vai trò thành ${vaiTro}`,
      nguoiDung: nguoiDung.toJSON()
    });
  } catch (error) {
    console.error('Lỗi cập nhật vai trò:', error);
    return res.status(500).json({ 
      thongBao: 'Có lỗi xảy ra khi cập nhật vai trò.', 
      chiTiet: error.message 
    });
  }
};

// Cập nhật trạng thái user (Admin/Moderator)
const capNhatTrangThai = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai } = req.body;

    if (!trangThai || !['active', 'suspended', 'banned'].includes(trangThai)) {
      return res.status(400).json({ 
        thongBao: 'Trạng thái không hợp lệ. Chỉ chấp nhận: active, suspended, banned' 
      });
    }

    const nguoiDung = await User.findById(id);
    if (!nguoiDung) {
      return res.status(404).json({ thongBao: 'Người dùng không tồn tại.' });
    }

    // Không cho phép khóa Admin
    if (nguoiDung.vaiTro === 'admin' && trangThai !== 'active') {
      return res.status(403).json({ 
        thongBao: 'Không thể khóa tài khoản Admin.' 
      });
    }

    // Moderator chỉ được khóa User, không được khóa Admin/Moderator khác
    if (req.nguoiDung.vaiTro === 'moderator') {
      if (nguoiDung.vaiTro !== 'user') {
        return res.status(403).json({ 
          thongBao: 'Moderator chỉ có thể khóa tài khoản User.' 
        });
      }
    }

    nguoiDung.trangThai = trangThai;
    await nguoiDung.save();

    return res.status(200).json({
      thongBao: `Đã cập nhật trạng thái thành ${trangThai}`,
      nguoiDung: nguoiDung.toJSON()
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái:', error);
    return res.status(500).json({ 
      thongBao: 'Có lỗi xảy ra khi cập nhật trạng thái.', 
      chiTiet: error.message 
    });
  }
};

// Cập nhật quyền hạn cụ thể (Admin only)
const capNhatQuyenHan = async (req, res) => {
  try {
    const { id } = req.params;
    const { quyenHan } = req.body;

    if (!Array.isArray(quyenHan)) {
      return res.status(400).json({ 
        thongBao: 'quyenHan phải là một mảng.' 
      });
    }

    const nguoiDung = await User.findById(id);
    if (!nguoiDung) {
      return res.status(404).json({ thongBao: 'Người dùng không tồn tại.' });
    }

    // Không cho phép sửa quyền của Admin
    if (nguoiDung.vaiTro === 'admin') {
      return res.status(403).json({ 
        thongBao: 'Không thể sửa quyền của Admin.' 
      });
    }

    nguoiDung.quyenHan = quyenHan;
    await nguoiDung.save();

    return res.status(200).json({
      thongBao: 'Đã cập nhật quyền hạn',
      nguoiDung: nguoiDung.toJSON()
    });
  } catch (error) {
    console.error('Lỗi cập nhật quyền hạn:', error);
    return res.status(500).json({ 
      thongBao: 'Có lỗi xảy ra khi cập nhật quyền hạn.', 
      chiTiet: error.message 
    });
  }
};

// Lấy danh sách users với filter theo role
const layDanhSachTheoVaiTro = async (req, res) => {
  try {
    const { vaiTro, trangThai } = req.query;
    const filter = {};

    if (vaiTro) {
      filter.vaiTro = vaiTro;
    }

    if (trangThai) {
      filter.trangThai = trangThai;
    }

    const danhSach = await User.find(filter).select('-matKhau').sort({ createdAt: -1 });

    return res.status(200).json({
      thongBao: 'Lấy danh sách thành công',
      soLuong: danhSach.length,
      danhSach
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách:', error);
    return res.status(500).json({ 
      thongBao: 'Có lỗi xảy ra khi lấy danh sách.', 
      chiTiet: error.message 
    });
  }
};

// Lấy thống kê users theo role
const thongKeTheoVaiTro = async (req, res) => {
  try {
    const tongUser = await User.countDocuments({ vaiTro: 'user' });
    const tongModerator = await User.countDocuments({ vaiTro: 'moderator' });
    const tongAdmin = await User.countDocuments({ vaiTro: 'admin' });
    const tongActive = await User.countDocuments({ trangThai: 'active' });
    const tongSuspended = await User.countDocuments({ trangThai: 'suspended' });
    const tongBanned = await User.countDocuments({ trangThai: 'banned' });

    return res.status(200).json({
      thongBao: 'Lấy thống kê thành công',
      thongKe: {
        vaiTro: {
          user: tongUser,
          moderator: tongModerator,
          admin: tongAdmin,
          tong: tongUser + tongModerator + tongAdmin
        },
        trangThai: {
          active: tongActive,
          suspended: tongSuspended,
          banned: tongBanned,
          tong: tongActive + tongSuspended + tongBanned
        }
      }
    });
  } catch (error) {
    console.error('Lỗi thống kê:', error);
    return res.status(500).json({ 
      thongBao: 'Có lỗi xảy ra khi lấy thống kê.', 
      chiTiet: error.message 
    });
  }
};

module.exports = {
  capNhatVaiTro,
  capNhatTrangThai,
  capNhatQuyenHan,
  layDanhSachTheoVaiTro,
  thongKeTheoVaiTro
};

