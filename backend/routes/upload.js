const express = require('express');
const { 
  uploadAvatar, 
  uploadAvatarMultiple,
  uploadMiddleware 
} = require('../controllers/uploadController');
const { xacThucToken } = require('../middleware/auth');
const { validateImageUpload, logUploadInfo } = require('../middleware/uploadValidation');

const router = express.Router();

// POST /api/upload/avatar - Upload avatar với Sharp resize (yêu cầu đăng nhập)
router.post(
  '/avatar', 
  xacThucToken, 
  uploadMiddleware, 
  validateImageUpload,
  logUploadInfo,
  uploadAvatar
);

// POST /api/upload/avatar-multiple - Upload nhiều kích thước
router.post(
  '/avatar-multiple',
  xacThucToken,
  uploadMiddleware,
  validateImageUpload,
  logUploadInfo,
  uploadAvatarMultiple
);

module.exports = router;

