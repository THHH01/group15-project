import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import './ResetPassword.css';

function ResetPassword() {
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [thongBao, setThongBao] = useState({ noiDung: '', loai: '' });
  const [dangGui, setDangGui] = useState(false);
  const [token, setToken] = useState('');
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [thanhCong, setThanhCong] = useState(false);

  const baseURL = useMemo(
    () => process.env.REACT_APP_API_URL || 'http://localhost:3000',
    []
  );

  useEffect(() => {
    // Lấy token từ URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setThongBao({ 
        noiDung: 'Link reset không hợp lệ. Vui lòng yêu cầu link mới.',
        loai: 'loi' 
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (matKhauMoi.length < 6) {
      setThongBao({ 
        noiDung: 'Mật khẩu phải có ít nhất 6 ký tự.',
        loai: 'loi' 
      });
      return;
    }

    if (matKhauMoi !== xacNhanMatKhau) {
      setThongBao({ 
        noiDung: 'Mật khẩu xác nhận không khớp.',
        loai: 'loi' 
      });
      return;
    }

    setDangGui(true);
    setThongBao({ noiDung: '', loai: '' });

    try {
      const response = await axios.post(`${baseURL}/api/password/reset`, {
        token,
        matKhauMoi
      });

      setThongBao({ 
        noiDung: response.data.thongBao || 'Đặt lại mật khẩu thành công!',
        loai: 'thanh-cong' 
      });
      
      setMatKhauMoi('');
      setXacNhanMatKhau('');
      setThanhCong(true);

      // Chuyển về trang đăng nhập sau 3 giây
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);

    } catch (error) {
      const msg = error.response?.data?.thongBao || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
      setThongBao({ noiDung: msg, loai: 'loi' });
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h2 className="reset-password-title">
            <span className="icon">🔑</span>
            Đặt lại mật khẩu
          </h2>
          <p className="reset-password-subtitle">
            Nhập mật khẩu mới của bạn bên dưới.
          </p>
        </div>

        {thongBao.noiDung && (
          <div className={`thong-bao ${thongBao.loai}`}>
            {thongBao.noiDung}
          </div>
        )}

        {thanhCong ? (
          <div className="reset-success">
            <div className="success-icon">🎉</div>
            <h3>Đặt lại mật khẩu thành công!</h3>
            <p>Mật khẩu của bạn đã được cập nhật.</p>
            <p className="redirect-info">
              Đang chuyển về trang đăng nhập... <span className="spinner">⏳</span>
            </p>
            <button 
              className="btn-login-now" 
              onClick={() => window.location.href = '/'}
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : token ? (
          <form className="reset-password-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="matKhauMoi">Mật khẩu mới</label>
              <div className="input-wrapper">
                <input
                  id="matKhauMoi"
                  type={hienMatKhau ? 'text' : 'password'}
                  placeholder="Ít nhất 6 ký tự"
                  value={matKhauMoi}
                  onChange={(e) => setMatKhauMoi(e.target.value)}
                  required
                  minLength={6}
                  disabled={dangGui}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setHienMatKhau(!hienMatKhau)}
                  tabIndex={-1}
                >
                  {hienMatKhau ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="xacNhanMatKhau">Xác nhận mật khẩu</label>
              <input
                id="xacNhanMatKhau"
                type={hienMatKhau ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu"
                value={xacNhanMatKhau}
                onChange={(e) => setXacNhanMatKhau(e.target.value)}
                required
                minLength={6}
                disabled={dangGui}
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit" 
              disabled={dangGui}
            >
              {dangGui ? '⏳ Đang xử lý...' : '✅ Đặt lại mật khẩu'}
            </button>
          </form>
        ) : (
          <div className="reset-password-footer">
            <p>
              <a href="/" className="link-button">← Quay lại trang đăng nhập</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;


