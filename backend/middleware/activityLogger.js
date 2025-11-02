const ActivityLog = require('../models/ActivityLog');

/**
 * Middleware ghi log hoạt động người dùng
 * @param {string} hanhDong - Tên hành động (vd: 'dang_nhap', 'cap_nhat_profile')
 * @param {function} layMoTa - Function trả về mô tả chi tiết (optional)
 */
const logActivity = (hanhDong, layMoTa = null) => {
  return async (req, res, next) => {
    // Lưu reference đến res.json gốc
    const originalJson = res.json.bind(res);

    // Override res.json để bắt response
    res.json = function (data) {
      // Xác định trạng thái dựa vào status code
      const trangThai = res.statusCode >= 200 && res.statusCode < 300 ? 'thanh_cong' : 'that_bai';

      // Tạo log entry
      const logEntry = {
        nguoiDungId: req.nguoiDung?.id || null,
        email: req.body?.email || req.nguoiDung?.email || '',
        hanhDong,
        moTa: layMoTa ? layMoTa(req, data) : `${hanhDong} - ${trangThai}`,
        diaChi: req.ip || req.connection?.remoteAddress || '',
        userAgent: req.get('user-agent') || '',
        trangThai,
        chiTiet: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          body: req.body ? Object.keys(req.body) : [],
          params: req.params
        }
      };

      // Lưu log bất đồng bộ (không chặn response)
      ActivityLog.create(logEntry).catch((error) => {
        console.error('❌ Lỗi lưu activity log:', error.message);
      });

      // Gọi res.json gốc
      return originalJson(data);
    };

    next();
  };
};

/**
 * Middleware ghi log đơn giản (không cần override res.json)
 * Dùng cho các trường hợp đã biết trước kết quả
 */
const logActivitySimple = async (req, hanhDong, trangThai = 'thanh_cong', moTa = '', chiTiet = {}) => {
  try {
    await ActivityLog.create({
      nguoiDungId: req.nguoiDung?.id || null,
      email: req.body?.email || req.nguoiDung?.email || '',
      hanhDong,
      moTa: moTa || `${hanhDong} - ${trangThai}`,
      diaChi: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.get('user-agent') || '',
      trangThai,
      chiTiet: {
        method: req.method,
        path: req.path,
        ...chiTiet
      }
    });
  } catch (error) {
    console.error('❌ Lỗi lưu activity log:', error.message);
  }
};

module.exports = { logActivity, logActivitySimple };

