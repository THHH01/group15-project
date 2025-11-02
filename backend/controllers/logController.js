const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// GET /api/logs - Lấy danh sách logs (Admin only)
const getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      hanhDong,
      nguoiDungId,
      email,
      trangThai,
      tuNgay,
      denNgay
    } = req.query;

    // Build query filter
    const filter = {};
    
    if (hanhDong) filter.hanhDong = hanhDong;
    if (nguoiDungId) filter.nguoiDungId = nguoiDungId;
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (trangThai) filter.trangThai = trangThai;
    
    if (tuNgay || denNgay) {
      filter.createdAt = {};
      if (tuNgay) filter.createdAt.$gte = new Date(tuNgay);
      if (denNgay) filter.createdAt.$lte = new Date(denNgay);
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    // Query
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('nguoiDungId', 'hoTen email vaiTro')
      .lean();

    const total = await ActivityLog.countDocuments(filter);

    return res.status(200).json({
      thongBao: 'Lấy danh sách logs thành công',
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Lỗi lấy logs:', error);
    return res.status(500).json({
      thongBao: 'Không thể lấy danh sách logs',
      chiTiet: error.message
    });
  }
};

// GET /api/logs/user/:id - Lấy logs của một user cụ thể
const getLogsByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    // Kiểm tra quyền: Admin hoặc chính user đó
    if (req.nguoiDung.vaiTro !== 'admin' && req.nguoiDung.id !== id) {
      return res.status(403).json({
        thongBao: 'Bạn không có quyền xem logs của user khác'
      });
    }

    const logs = await ActivityLog.layLogTheoUser(id, parseInt(limit));

    return res.status(200).json({
      thongBao: 'Lấy logs của user thành công',
      logs
    });
  } catch (error) {
    console.error('Lỗi lấy logs theo user:', error);
    return res.status(500).json({
      thongBao: 'Không thể lấy logs của user',
      chiTiet: error.message
    });
  }
};

// GET /api/logs/stats - Thống kê hoạt động
const getLogStats = async (req, res) => {
  try {
    const { tuNgay, denNgay } = req.query;

    const tuNgayDate = tuNgay ? new Date(tuNgay) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const denNgayDate = denNgay ? new Date(denNgay) : new Date();

    // Thống kê theo hành động
    const thongKeHanhDong = await ActivityLog.thongKeHoatDong(tuNgayDate, denNgayDate);

    // Thống kê tổng quan
    const tongSoLog = await ActivityLog.countDocuments({
      createdAt: { $gte: tuNgayDate, $lte: denNgayDate }
    });

    const soLogThanhCong = await ActivityLog.countDocuments({
      createdAt: { $gte: tuNgayDate, $lte: denNgayDate },
      trangThai: 'thanh_cong'
    });

    const soLogThatBai = await ActivityLog.countDocuments({
      createdAt: { $gte: tuNgayDate, $lte: denNgayDate },
      trangThai: 'that_bai'
    });

    // Top users hoạt động nhiều nhất
    const topUsers = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: tuNgayDate, $lte: denNgayDate },
          nguoiDungId: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$nguoiDungId',
          soLuong: { $sum: 1 }
        }
      },
      {
        $sort: { soLuong: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'nguoiDung'
        }
      },
      {
        $unwind: '$nguoiDung'
      },
      {
        $project: {
          _id: 1,
          soLuong: 1,
          hoTen: '$nguoiDung.hoTen',
          email: '$nguoiDung.email',
          vaiTro: '$nguoiDung.vaiTro'
        }
      }
    ]);

    // Thống kê login thất bại
    const soLoginThatBai = await ActivityLog.countDocuments({
      createdAt: { $gte: tuNgayDate, $lte: denNgayDate },
      hanhDong: 'dang_nhap_that_bai'
    });

    return res.status(200).json({
      thongBao: 'Lấy thống kê thành công',
      thongKe: {
        tongSoLog,
        soLogThanhCong,
        soLogThatBai,
        soLoginThatBai,
        tyLeThanhCong: tongSoLog > 0 ? ((soLogThanhCong / tongSoLog) * 100).toFixed(2) + '%' : '0%',
        thongKeHanhDong,
        topUsers
      },
      thoiGian: {
        tuNgay: tuNgayDate,
        denNgay: denNgayDate
      }
    });
  } catch (error) {
    console.error('Lỗi lấy thống kê logs:', error);
    return res.status(500).json({
      thongBao: 'Không thể lấy thống kê',
      chiTiet: error.message
    });
  }
};

// DELETE /api/logs/cleanup - Xóa logs cũ (Admin only)
const cleanupOldLogs = async (req, res) => {
  try {
    const { soNgay = 90 } = req.body;

    const result = await ActivityLog.xoaLogCu(parseInt(soNgay));

    return res.status(200).json({
      thongBao: `Đã xóa ${result.deletedCount} logs cũ hơn ${soNgay} ngày`,
      soLogDaXoa: result.deletedCount
    });
  } catch (error) {
    console.error('Lỗi xóa logs cũ:', error);
    return res.status(500).json({
      thongBao: 'Không thể xóa logs cũ',
      chiTiet: error.message
    });
  }
};

// GET /api/logs/recent - Lấy logs gần đây (cho dashboard)
const getRecentLogs = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('nguoiDungId', 'hoTen email vaiTro')
      .lean();

    return res.status(200).json({
      thongBao: 'Lấy logs gần đây thành công',
      logs
    });
  } catch (error) {
    console.error('Lỗi lấy logs gần đây:', error);
    return res.status(500).json({
      thongBao: 'Không thể lấy logs gần đây',
      chiTiet: error.message
    });
  }
};

module.exports = {
  getLogs,
  getLogsByUser,
  getLogStats,
  cleanupOldLogs,
  getRecentLogs
};

