import React, { useState } from 'react';
import Profile from './Profile';
import AdminUserList from './AdminUserList';
import './HomePage.css';

function HomePage() {
  const [trangHienTai, setTrangHienTai] = useState('trang-chu');
  const [nguoiDung, setNguoiDung] = useState(() => {
    const luuTru = localStorage.getItem('nguoiDung');
    const user = luuTru ? JSON.parse(luuTru) : null;
    return user;
  });

  const handleDangXuat = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nguoiDung');
    window.location.reload();
  };

  const renderNoiDung = () => {
    switch (trangHienTai) {
      case 'profile':
        return <Profile />;
      case 'quan-ly-user':
        return <AdminUserList />;
      case 'trang-chu':
      default:
        return (
          <div className="noi-dung-trang-chu">
            <div className="welcome-card">
              <h2>Chào mừng, {nguoiDung?.hoTen || 'Người dùng'}!</h2>
              <p className="welcome-text">
                Bạn đã đăng nhập thành công vào hệ thống.
              </p>
              
              <div className="thong-tin-nhanh">
                <div className="info-box">
                  {nguoiDung?.avatar ? (
                    <img 
                      src={nguoiDung.avatar} 
                      alt="Avatar" 
                      className="avatar-icon"
                    />
                  ) : (
                    <div className="avatar-placeholder-icon">
                      {nguoiDung?.hoTen?.charAt(0).toUpperCase() || '👤'}
                    </div>
                  )}
                  <div>
                    <h3>Thông tin cá nhân</h3>
                    <p>Email: {nguoiDung?.email}</p>
                    <p>Vai trò: {nguoiDung?.vaiTro}</p>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => setTrangHienTai('profile')}
                >
                  <span>👤</span>
                  Xem Profile
                </button>
                <button className="action-btn secondary">
                  <span>⚙️</span>
                  Cài đặt
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>🏠 Hệ Thống Quản Lý</h1>
          </div>
          
          <nav className="navigation">
            <button 
              className={trangHienTai === 'trang-chu' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setTrangHienTai('trang-chu')}
            >
              Trang chủ
            </button>
            <button 
              className={trangHienTai === 'profile' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setTrangHienTai('profile')}
            >
              Profile
            </button>
            {nguoiDung?.vaiTro === 'admin' && (
              <button 
                className={trangHienTai === 'quan-ly-user' ? 'nav-btn active' : 'nav-btn'}
                onClick={() => setTrangHienTai('quan-ly-user')}
              >
                👥 Quản lý User
              </button>
            )}
          </nav>

          <div className="user-menu">
            <div className="user-info">
              <span className="user-name">{nguoiDung?.hoTen}</span>
              <span className="user-role badge">{nguoiDung?.vaiTro}</span>
            </div>
            <button className="btn-logout" onClick={handleDangXuat}>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {renderNoiDung()}
      </main>

      <footer className="footer">
        <p>&copy; 2025 Hệ thống quản lý. Phát triển bởi Nhóm 15.</p>
      </footer>
    </div>
  );
}

export default HomePage;

