const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Cấu hình email transporter (cho môi trường dev, dùng Gmail hoặc fake SMTP)
const taoEmailTransporter = () => {
  // Trong production, dùng Gmail, SendGrid, hoặc dịch vụ email khác
  // Hiện tại dùng Ethereal Email cho testing (fake SMTP)
  
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    console.warn('⚠️ Chưa cấu hình EMAIL_USER và EMAIL_PASS trong .env');
    console.warn('💡 Sử dụng console.log để hiển thị link reset password thay vì gửi email thực');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail', // Hoặc 'smtp.ethereal.email' cho testing
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

// POST /api/password/forgot - Quên mật khẩu
const quenMatKhau = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ thongBao: 'Vui lòng cung cấp email.' });
    }

    // Tìm user theo email
    const nguoiDung = await User.findOne({ email: email.toLowerCase() });
    
    if (!nguoiDung) {
      // Bảo mật: không tiết lộ email có tồn tại hay không
      return res.status(200).json({ 
        thongBao: 'Nếu email tồn tại, chúng tôi đã gửi link reset mật khẩu đến email của bạn.' 
      });
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token trước khi lưu vào DB (bảo mật)
    nguoiDung.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Token hết hạn sau 1 giờ
    nguoiDung.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    
    await nguoiDung.save();

    // Tạo reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;

    // Gửi email
    const transporter = taoEmailTransporter();
    
    if (!transporter) {
      // Môi trường dev: log ra console
      console.log('🔗 Reset Password URL:', resetUrl);
      console.log('📧 Email:', nguoiDung.email);
      console.log('⏰ Hết hạn:', new Date(nguoiDung.resetPasswordExpires).toLocaleString('vi-VN'));
      
      return res.status(200).json({ 
        thongBao: 'Link reset mật khẩu đã được tạo (check console để lấy link trong môi trường dev).',
        devOnly: {
          resetUrl,
          expiresAt: nguoiDung.resetPasswordExpires
        }
      });
    }

    // Gửi email thực
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: nguoiDung.email,
        subject: 'Đặt lại mật khẩu - Hệ thống Quản lý',
        html: `
          <h2>Yêu cầu đặt lại mật khẩu</h2>
          <p>Xin chào <strong>${nguoiDung.hoTen}</strong>,</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới để tiếp tục:</p>
          <a href="${resetUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #0284c7;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            margin: 16px 0;
          ">Đặt lại mật khẩu</a>
          <p>Hoặc copy link này vào trình duyệt:</p>
          <p style="color: #64748b;">${resetUrl}</p>
          <p><strong>Link này sẽ hết hạn sau 1 giờ.</strong></p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">© 2025 Hệ thống Quản lý - Nhóm 15</p>
        `
      });

      return res.status(200).json({ 
        thongBao: 'Link reset mật khẩu đã được gửi đến email của bạn.' 
      });
    } catch (emailError) {
      console.error('Lỗi gửi email:', emailError);
      return res.status(500).json({ 
        thongBao: 'Không thể gửi email. Vui lòng thử lại sau.',
        chiTiet: emailError.message 
      });
    }

  } catch (error) {
    console.error('Lỗi quên mật khẩu:', error);
    return res.status(500).json({ 
      thongBao: 'Không thể xử lý yêu cầu quên mật khẩu.', 
      chiTiet: error.message 
    });
  }
};

// POST /api/password/reset - Đặt lại mật khẩu với token
const datLaiMatKhau = async (req, res) => {
  try {
    const { token, matKhauMoi } = req.body;

    if (!token || !matKhauMoi) {
      return res.status(400).json({ 
        thongBao: 'Vui lòng cung cấp token và mật khẩu mới.' 
      });
    }

    if (matKhauMoi.length < 6) {
      return res.status(400).json({ 
        thongBao: 'Mật khẩu phải có ít nhất 6 ký tự.' 
      });
    }

    // Hash token từ request để so sánh với DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Tìm user với token hợp lệ và chưa hết hạn
    const nguoiDung = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!nguoiDung) {
      return res.status(400).json({ 
        thongBao: 'Token không hợp lệ hoặc đã hết hạn.' 
      });
    }

    // Cập nhật mật khẩu mới
    nguoiDung.matKhau = matKhauMoi;
    nguoiDung.resetPasswordToken = '';
    nguoiDung.resetPasswordExpires = null;
    
    await nguoiDung.save();

    return res.status(200).json({ 
      thongBao: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.' 
    });

  } catch (error) {
    console.error('Lỗi đặt lại mật khẩu:', error);
    return res.status(500).json({ 
      thongBao: 'Không thể đặt lại mật khẩu.', 
      chiTiet: error.message 
    });
  }
};

module.exports = { quenMatKhau, datLaiMatKhau };

