import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { dangKy, clearError } from '../store/slices/authSlice';
import '../App.css';

function SignupPage() {
  const [formData, setFormData] = useState({ hoTen: '', email: '', matKhau: '' });
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(dangKy(formData));
    
    if (dangKy.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">📝 Đăng ký tài khoản</h2>
        
        {error && (
          <div className="thong-bao loi">
            {error}
          </div>
        )}

        {success && (
          <div className="thong-bao thanh-cong">
            Đăng ký thành công! Đang chuyển đến trang đăng nhập...
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="hoTen">Họ và tên</label>
            <input
              id="hoTen"
              type="text"
              placeholder="Nguyễn Văn A"
              value={formData.hoTen}
              onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
              required
              disabled={isLoading || success}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading || success}
            />
          </div>

          <div className="form-group">
            <label htmlFor="matKhau">Mật khẩu</label>
            <input
              id="matKhau"
              type="password"
              placeholder="Ít nhất 6 ký tự"
              value={formData.matKhau}
              onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
              required
              minLength={6}
              disabled={isLoading || success}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading || success}>
            {isLoading ? '⏳ Đang đăng ký...' : '✅ Đăng ký'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Đã có tài khoản? <Link to="/login" className="link">Đăng nhập ngay</Link></p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;

