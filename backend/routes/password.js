const express = require('express');
const { quenMatKhau, datLaiMatKhau } = require('../controllers/passwordController');

const router = express.Router();

// POST /api/password/forgot - Quên mật khẩu
router.post('/forgot', quenMatKhau);

// POST /api/password/reset - Đặt lại mật khẩu
router.post('/reset', datLaiMatKhau);

module.exports = router;

