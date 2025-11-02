const express = require('express');
const { xacThucToken } = require('../middleware/auth');
const { kiemTraVaiTro } = require('../middleware/rbac');
const {
  getLogs,
  getLogsByUser,
  getLogStats,
  cleanupOldLogs,
  getRecentLogs
} = require('../controllers/logController');

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.use(xacThucToken);

// GET /api/logs - Lấy danh sách logs (Admin, Moderator)
router.get('/', kiemTraVaiTro('admin', 'moderator'), getLogs);

// GET /api/logs/recent - Lấy logs gần đây (Admin, Moderator)
router.get('/recent', kiemTraVaiTro('admin', 'moderator'), getRecentLogs);

// GET /api/logs/stats - Thống kê hoạt động (Admin, Moderator)
router.get('/stats', kiemTraVaiTro('admin', 'moderator'), getLogStats);

// GET /api/logs/user/:id - Lấy logs của một user (Admin hoặc chính user đó)
router.get('/user/:id', getLogsByUser);

// DELETE /api/logs/cleanup - Xóa logs cũ (Admin only)
router.delete('/cleanup', kiemTraVaiTro('admin'), cleanupOldLogs);

module.exports = router;

