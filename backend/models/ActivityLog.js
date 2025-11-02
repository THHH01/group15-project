const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    nguoiDungId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Có thể null cho các hoạt động không cần đăng nhập (ví dụ: failed login)
    },
    email: {
      type: String,
      required: false // Lưu email cho trường hợp login thất bại
    },
    hanhDong: {
      type: String,
      required: true,
      enum: [
        'dang_nhap',
        'dang_xuat',
        'dang_ky',
        'cap_nhat_profile',
        'doi_mat_khau',
        'quen_mat_khau',
        'reset_mat_khau',
        'upload_avatar',
        'xem_danh_sach_user',
        'xoa_user',
        'cap_nhat_vai_tro',
        'cap_nhat_trang_thai',
        'cap_nhat_quyen_han',
        'dang_nhap_that_bai',
        'truy_cap_khong_duoc_phep'
      ]
    },
    moTa: {
      type: String,
      default: ''
    },
    diaChi: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    trangThai: {
      type: String,
      enum: ['thanh_cong', 'that_bai'],
      default: 'thanh_cong'
    },
    chiTiet: {
      type: mongoose.Schema.Types.Mixed, // Lưu thêm thông tin chi tiết (JSON)
      default: {}
    }
  },
  {
    timestamps: true // Tự động tạo createdAt và updatedAt
  }
);

// Index để tăng tốc độ truy vấn
activityLogSchema.index({ nguoiDungId: 1, createdAt: -1 });
activityLogSchema.index({ hanhDong: 1, createdAt: -1 });
activityLogSchema.index({ email: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

// Static method: Lấy logs theo user
activityLogSchema.statics.layLogTheoUser = function (nguoiDungId, limit = 50) {
  return this.find({ nguoiDungId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method: Lấy logs theo hành động
activityLogSchema.statics.layLogTheoHanhDong = function (hanhDong, limit = 100) {
  return this.find({ hanhDong })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('nguoiDungId', 'hoTen email vaiTro')
    .lean();
};

// Static method: Lấy logs login thất bại gần đây
activityLogSchema.statics.layLogDangNhapThatBai = function (email, thoiGian = 15 * 60 * 1000) {
  const thoiGianGioiHan = new Date(Date.now() - thoiGian);
  return this.find({
    email,
    hanhDong: 'dang_nhap_that_bai',
    createdAt: { $gte: thoiGianGioiHan }
  }).countDocuments();
};

// Static method: Xóa logs cũ (cleanup)
activityLogSchema.statics.xoaLogCu = function (soNgay = 90) {
  const thoiGianGioiHan = new Date(Date.now() - soNgay * 24 * 60 * 60 * 1000);
  return this.deleteMany({ createdAt: { $lt: thoiGianGioiHan } });
};

// Static method: Thống kê hoạt động
activityLogSchema.statics.thongKeHoatDong = function (tuNgay, denNgay) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: tuNgay || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          $lte: denNgay || new Date()
        }
      }
    },
    {
      $group: {
        _id: '$hanhDong',
        soLuong: { $sum: 1 }
      }
    },
    {
      $sort: { soLuong: -1 }
    }
  ]);
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);

