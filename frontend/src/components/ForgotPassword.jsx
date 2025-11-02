import React, { useState, useMemo } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [thongBao, setThongBao] = useState({ noiDung: '', loai: '' });
  const [dangGui, setDangGui] = useState(false);
  const [daGuiEmail, setDaGuiEmail] = useState(false);
  const [emailDaGui, setEmailDaGui] = useState('');

  const baseURL = useMemo(
    () => process.env.REACT_APP_API_URL || 'http://localhost:3000',
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDangGui(true);
    setThongBao({ noiDung: '', loai: '' });

    try {
      const response = await axios.post(`${baseURL}/api/password/forgot`, { email });
      setThongBao({ 
        noiDung: response.data.thongBao || 'Link reset mật khẩu đã được gửi đến email của bạn.',
        loai: 'thanh-cong' 
      });
      
      // Lưu email đã gửi
      setEmailDaGui(email);
      setDaGuiEmail(true);
      
      // Nếu dev mode, hiển thị link
      if (response.data.devOnly && response.data.devOnly.resetUrl) {
        console.log('🔗 Reset URL:', response.data.devOnly.resetUrl);
        setThongBao({ 
          noiDung: `Link reset mật khẩu đã được tạo. Kiểm tra console để lấy link (dev mode).`,
          loai: 'thanh-cong' 
        });
      }
      
      setEmail('');
    } catch (error) {
      const msg = error.response?.data?.thongBao || 'Không thể gửi yêu cầu. Vui lòng thử lại.';
      setThongBao({ noiDung: msg, loai: 'loi' });
      setDaGuiEmail(false);
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <button className="btn-back" onClick={onBack}>
            ← Quay lại
          </button>
          <h2 className="forgot-password-title">
            <span className="icon">🔐</span>
            Quên mật khẩu?
          </h2>
          <p className="forgot-password-subtitle">
            Nhập email của bạn và chúng tôi sẽ gửi link để đặt lại mật khẩu.
          </p>
        </div>

        {thongBao.noiDung && (
          <div className={`thong-bao ${thongBao.loai}`}>
            {thongBao.noiDung}
          </div>
        )}

        {daGuiEmail ? (
          <div className="email-sent-success">
            <div className="success-icon">✅</div>
            <h3>Email đã được gửi!</h3>
            <p className="email-info">
              Chúng tôi đã gửi link reset mật khẩu đến:
              <br />
              <strong>{emailDaGui}</strong>
            </p>
            <div className="instructions">
              <p>📬 <strong>Hướng dẫn tiếp theo:</strong></p>
              <ol>
                <li>Kiểm tra hộp thư đến của bạn</li>
                <li>Nếu không thấy, kiểm tra thư mục <strong>Spam/Junk</strong></li>
                <li>Nhấn vào link trong email để đặt lại mật khẩu</li>
                <li>Link sẽ hết hạn sau <strong>1 giờ</strong></li>
              </ol>
            </div>
            <div className="action-buttons">
              <button 
                className="btn-resend" 
                onClick={() => {
                  setDaGuiEmail(false);
                  setEmail(emailDaGui);
                  setThongBao({ noiDung: '', loai: '' });
                }}
              >
                📧 Gửi lại email
              </button>
              <button className="btn-back-login" onClick={onBack}>
                ← Quay lại đăng nhập
              </button>
            </div>
          </div>
        ) : (
          <>
            <form className="forgot-password-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={dangGui}
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit" 
                disabled={dangGui}
              >
                {dangGui ? '⏳ Đang gửi...' : '📧 Gửi link reset mật khẩu'}
              </button>
            </form>

            <div className="forgot-password-footer">
              <p>Nhớ mật khẩu rồi? <button className="link-button" onClick={onBack}>Đăng nhập</button></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;


