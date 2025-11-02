const User = require('../models/User');

// GET /profile - Xem thông tin cá nhân
const xemProfile = async (req, res) => {
  try {
    const nguoiDung = await User.findById(req.nguoiDung.id).select('-matKhau');

    if (!nguoiDung) {
      return res.status(404).json({ thongBao: 'Không tìm thấy người dùng.' });
    }

    return res.status(200).json({
      thongBao: 'Lấy thông tin cá nhân thành công',
      nguoiDung
    });
  } catch (error) {
    console.error('Lỗi xem profile:', error);
    return res.status(500).json({ thongBao: 'Không thể lấy thông tin cá nhân', chiTiet: error.message });
  }
};

// PUT /profile - Cập nhật thông tin cá nhân
const capNhatProfile = async (req, res) => {
  try {
    const { hoTen, email } = req.body;
    const capNhat = {};

    if (hoTen !== undefined) {
      if (!hoTen.trim() || hoTen.trim().length < 2) {
        return res.status(400).json({ thongBao: 'Họ và tên phải có ít nhất 2 ký tự.' });
      }
      capNhat.hoTen = hoTen.trim();
    }

    if (email !== undefined) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ thongBao: 'Định dạng email không hợp lệ.' });
      }

      const emailDaTonTai = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.nguoiDung.id }
      });

      if (emailDaTonTai) {
        return res.status(409).json({ thongBao: 'Email đã được sử dụng bởi người dùng khác.' });
      }

      capNhat.email = email.toLowerCase();
    }

    if (Object.keys(capNhat).length === 0) {
      return res.status(400).json({ thongBao: 'Không có thông tin nào để cập nhật.' });
    }

    const nguoiDung = await User.findByIdAndUpdate(
      req.nguoiDung.id,
      capNhat,
      { new: true, runValidators: true }
    ).select('-matKhau');

    if (!nguoiDung) {
      return res.status(404).json({ thongBao: 'Không tìm thấy người dùng.' });
    }

    return res.status(200).json({
      thongBao: 'Cập nhật thông tin cá nhân thành công',
      nguoiDung
    });
  } catch (error) {
    console.error('Lỗi cập nhật profile:', error);
    return res.status(500).json({ thongBao: 'Không thể cập nhật thông tin cá nhân', chiTiet: error.message });
  }
};

module.exports = {
  xemProfile,
  capNhatProfile
};

