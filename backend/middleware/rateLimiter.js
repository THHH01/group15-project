const rateLimit = require('express-rate-limit');
const ActivityLog = require('../models/ActivityLog');

/**
 * Rate limiter cho login - chống brute force
 * Giới hạn: 5 lần đăng nhập thất bại trong 15 phút
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 requests
  message: {
    thongBao: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.',
    code: 'TOO_MANY_REQUESTS'
  },
  standardHeaders: true, // Trả về rate limit info trong `RateLimit-*` headers
  legacyHeaders: false, // Tắt `X-RateLimit-*` headers
  
  // Chỉ đếm các request thất bại (status 4xx, 5xx)
  skipSuccessfulRequests: true,
  
  // Key generator: Dựa vào IP + email (nếu có)
  keyGenerator: (req) => {
    const email = req.body?.email || 'unknown';
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    return `${ip}-${email}`;
  },
  
  // Handler khi vượt quá giới hạn
  handler: async (req, res) => {
    // Ghi log
    await ActivityLog.create({
      email: req.body?.email || '',
      hanhDong: 'dang_nhap_that_bai',
      moTa: 'Vượt quá giới hạn đăng nhập (rate limit)',
      diaChi: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.get('user-agent') || '',
      trangThai: 'that_bai',
      chiTiet: {
        reason: 'rate_limit_exceeded',
        windowMs: 15 * 60 * 1000,
        max: 5
      }
    }).catch((error) => {
      console.error('❌ Lỗi lưu rate limit log:', error.message);
    });

    res.status(429).json({
      thongBao: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.',
      code: 'TOO_MANY_REQUESTS',
      retryAfter: '15 phút'
    });
  }
});

/**
 * Rate limiter cho signup - chống spam tạo tài khoản
 * Giới hạn: 3 tài khoản mới trong 1 giờ từ cùng 1 IP
 */
const signupRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Giới hạn 3 requests
  message: {
    thongBao: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ.',
    code: 'TOO_MANY_SIGNUPS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return req.ip || req.connection?.remoteAddress || 'unknown';
  },
  
  handler: (req, res) => {
    res.status(429).json({
      thongBao: 'Quá nhiều lần đăng ký từ IP này. Vui lòng thử lại sau 1 giờ.',
      code: 'TOO_MANY_SIGNUPS',
      retryAfter: '1 giờ'
    });
  }
});

/**
 * Rate limiter cho forgot password - chống spam email
 * Giới hạn: 3 lần yêu cầu reset password trong 1 giờ
 */
const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Giới hạn 3 requests
  message: {
    thongBao: 'Quá nhiều yêu cầu reset mật khẩu. Vui lòng thử lại sau 1 giờ.',
    code: 'TOO_MANY_REQUESTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    const email = req.body?.email || 'unknown';
    return email;
  },
  
  handler: (req, res) => {
    res.status(429).json({
      thongBao: 'Quá nhiều yêu cầu reset mật khẩu. Vui lòng thử lại sau 1 giờ.',
      code: 'TOO_MANY_REQUESTS',
      retryAfter: '1 giờ'
    });
  }
});

/**
 * Rate limiter chung cho API - bảo vệ toàn bộ hệ thống
 * Giới hạn: 100 requests trong 15 phút
 */
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn 100 requests
  message: {
    thongBao: 'Quá nhiều requests. Vui lòng thử lại sau.',
    code: 'TOO_MANY_REQUESTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    res.status(429).json({
      thongBao: 'Quá nhiều requests. Vui lòng thử lại sau 15 phút.',
      code: 'TOO_MANY_REQUESTS',
      retryAfter: '15 phút'
    });
  }
});

module.exports = {
  loginRateLimiter,
  signupRateLimiter,
  forgotPasswordRateLimiter,
  generalRateLimiter
};

