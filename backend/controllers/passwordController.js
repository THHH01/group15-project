const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Cấu hình email transporter với Gmail SMTP
const taoEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    console.warn('⚠️ Chưa cấu hình EMAIL_USER và EMAIL_PASS trong .env');
    console.warn('💡 Hướng dẫn cấu hình Gmail:');
    console.warn('   1. Bật xác thực 2 bước: https://myaccount.google.com/security');
    console.warn('   2. Tạo App Password: https://myaccount.google.com/apppasswords');
    console.warn('   3. Thêm vào .env: EMAIL_USER=your-email@gmail.com và EMAIL_PASS=app-password');
    console.warn('💡 Sử dụng console.log để hiển thị link reset password thay vì gửi email thực');
    return null;
  }

  // Cấu hình Gmail SMTP
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass // App Password (16 ký tự, không có khoảng trắng)
    },
    // Cấu hình bổ sung cho Gmail
    tls: {
      rejectUnauthorized: false // Cho phép self-signed certificates (dev only)
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
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Token hết hạn sau 1 giờ
    const expiryTime = Date.now() + 60 * 60 * 1000; // 1 hour
    
    // Update trực tiếp không trigger validation
    await User.updateOne(
      { _id: nguoiDung._id },
      { 
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiryTime
      }
    );

    // Tạo reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;

    // Gửi email
    const transporter = taoEmailTransporter();
    
    if (!transporter) {
      // Môi trường dev: log ra console
      console.log('🔗 Reset Password URL:', resetUrl);
      console.log('📧 Email:', nguoiDung.email);
      console.log('⏰ Hết hạn:', new Date(expiryTime).toLocaleString('vi-VN'));
      
      return res.status(200).json({ 
        thongBao: 'Link reset mật khẩu đã được tạo (check console để lấy link trong môi trường dev).',
        devOnly: {
          resetUrl,
          expiresAt: expiryTime
        }
      });
    }

    // Gửi email thực qua Gmail SMTP
    try {
      console.log('📧 Đang gửi email đến:', nguoiDung.email);
      
      const mailOptions = {
        from: `"Hệ thống Quản lý - Nhóm 15" <${process.env.EMAIL_USER}>`,
        to: nguoiDung.email,
        subject: '🔐 Đặt lại mật khẩu - Hệ thống Quản lý',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
              .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
              .content { padding: 32px 24px; }
              .greeting { font-size: 18px; color: #1e293b; margin-bottom: 16px; }
              .message { font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
              .button-container { text-align: center; margin: 32px 0; }
              .button { display: inline-block; padding: 14px 32px; background-color: #0284c7; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(2, 132, 199, 0.3); transition: all 0.3s; }
              .button:hover { background-color: #0369a1; box-shadow: 0 6px 8px rgba(2, 132, 199, 0.4); }
              .link-box { background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 24px 0; word-break: break-all; }
              .link-text { color: #0369a1; font-size: 14px; margin: 0; }
              .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px; }
              .warning-text { color: #92400e; font-size: 14px; margin: 0; font-weight: 600; }
              .footer { background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; }
              .footer-text { color: #64748b; font-size: 13px; margin: 4px 0; }
              .icon { font-size: 48px; margin-bottom: 16px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="icon">🔐</div>
                <h1>Đặt lại mật khẩu</h1>
              </div>
              <div class="content">
                <p class="greeting">Xin chào <strong>${nguoiDung.hoTen || nguoiDung.email.split('@')[0]}</strong>,</p>
                <p class="message">
                  Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                  Nhấn vào nút bên dưới để tiếp tục:
                </p>
                <div class="button-container">
                  <a href="${resetUrl}" class="button">Đặt lại mật khẩu ngay</a>
                </div>
                <p class="message">Hoặc copy link này vào trình duyệt:</p>
                <div class="link-box">
                  <p class="link-text">${resetUrl}</p>
                </div>
                <div class="warning">
                  <p class="warning-text">⏰ Link này sẽ hết hạn sau 1 giờ (${new Date(expiryTime).toLocaleString('vi-VN')})</p>
                </div>
                <p class="message">
                  Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. 
                  Mật khẩu của bạn sẽ không thay đổi.
                </p>
              </div>
              <div class="footer">
                <p class="footer-text"><strong>Hệ thống Quản lý - Nhóm 15</strong></p>
                <p class="footer-text">© 2025 All rights reserved</p>
                <p class="footer-text">📧 ${process.env.EMAIL_USER}</p>
              </div>
            </div>
          </body>
          </html>
        `,
        // Text version cho email clients không hỗ trợ HTML
        text: `
Xin chào ${nguoiDung.hoTen || nguoiDung.email.split('@')[0]},

Bạn đã yêu cầu đặt lại mật khẩu. Truy cập link sau để tiếp tục:
${resetUrl}

Link này sẽ hết hạn sau 1 giờ (${new Date(expiryTime).toLocaleString('vi-VN')}).

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

---
Hệ thống Quản lý - Nhóm 15
© 2025
        `
      };

      await transporter.sendMail(mailOptions);
      
      console.log('✅ Email đã được gửi thành công đến:', nguoiDung.email);

      return res.status(200).json({ 
        thongBao: 'Link reset mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (kể cả thư mục Spam).',
        email: nguoiDung.email
      });
    } catch (emailError) {
      console.error('❌ Lỗi gửi email:', emailError);
      console.error('Chi tiết lỗi:', emailError.message);
      
      // Log thêm thông tin để debug
      if (emailError.code === 'EAUTH') {
        console.error('💡 Lỗi xác thực Gmail. Hãy kiểm tra:');
        console.error('   - EMAIL_USER có đúng không?');
        console.error('   - EMAIL_PASS có phải App Password (16 ký tự) không?');
        console.error('   - Đã bật xác thực 2 bước chưa?');
      }
      
      return res.status(500).json({ 
        thongBao: 'Không thể gửi email. Vui lòng kiểm tra cấu hình email hoặc thử lại sau.',
        chiTiet: emailError.message,
        code: emailError.code
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

    // Cập nhật mật khẩu mới (dùng updateOne để tránh validation)
    // Mật khẩu sẽ được hash bởi pre-save hook trong User model
    const matKhauMaHoa = await bcrypt.hash(matKhauMoi, 10);
    
    await User.updateOne(
      { _id: nguoiDung._id },
      {
        matKhau: matKhauMaHoa,
        resetPasswordToken: '',
        resetPasswordExpires: null
      }
    );

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

