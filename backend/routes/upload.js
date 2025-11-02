const express = require('express');
const { uploadAvatar, uploadMiddleware } = require('../controllers/uploadController');
const { xacThucToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/upload/avatar - Upload avatar (yêu cầu đăng nhập)
router.post('/avatar', xacThucToken, uploadMiddleware, uploadAvatar);

module.exports = router;

