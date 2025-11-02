const express = require('express');
const { quenMatKhau, datLaiMatKhau } = require('../controllers/passwordController');
const { forgotPasswordRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// POST /api/password/forgot - Quên mật khẩu (với rate limiting)
router.post('/forgot', forgotPasswordRateLimiter, quenMatKhau);

// POST /api/password/reset - Đặt lại mật khẩu
router.post('/reset', datLaiMatKhau);

module.exports = router;

