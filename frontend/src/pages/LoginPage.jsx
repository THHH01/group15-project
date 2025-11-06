import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { dangNhap, clearError } from '../store/slices/authSlice';
import '../App.css';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', matKhau: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(dangNhap(formData));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">🔐 Đăng nhập</h2>
        
        {error && (
          <div className="thong-bao loi">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="matKhau">Mật khẩu</label>
            <input
              id="matKhau"
              type="password"
              placeholder="Nhập mật khẩu"
              value={formData.matKhau}
              onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? '⏳ Đang đăng nhập...' : '🔓 Đăng nhập'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Chưa có tài khoản? <Link to="/signup" className="link">Đăng ký ngay</Link></p>
          <p><Link to="/forgot-password" className="link">Quên mật khẩu?</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

