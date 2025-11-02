const express = require('express');
const { dangKy, dangNhap, dangXuat, lamMoiToken } = require('../controllers/authController');
const { loginRateLimiter, signupRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Áp dụng rate limiting cho signup và login
router.post('/signup', signupRateLimiter, dangKy);
router.post('/login', loginRateLimiter, dangNhap);
router.post('/logout', dangXuat);
router.post('/refresh', lamMoiToken);

module.exports = router;

