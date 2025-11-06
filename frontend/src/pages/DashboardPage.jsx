import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { dangXuat } from '../store/slices/authSlice';
import Profile from '../components/Profile';
import AdminUserList from '../components/AdminUserList';
import ActivityLogs from '../components/ActivityLogs';
import '../components/HomePage.css';

function DashboardPage() {
  const [trangHienTai, setTrangHienTai] = useState('trang-chu');
  const { nguoiDung } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDangXuat = async () => {
    await dispatch(dangXuat());
    navigate('/login');
  };

  const renderNoiDung = () => {
    switch (trangHienTai) {
      case 'profile':
        return <Profile />;
      case 'quan-ly-user':
        return <AdminUserList />;
      case 'activity-logs':
        return <ActivityLogs />;
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
                    <strong>{nguoiDung?.hoTen}</strong>
                    <p>{nguoiDung?.email}</p>
                  </div>
                </div>
                <div className="info-box">
                  <span className="icon">👑</span>
                  <div>
                    <strong>Vai trò</strong>
                    <p>{nguoiDung?.vaiTro === 'admin' ? 'Quản trị viên' : nguoiDung?.vaiTro === 'moderator' ? 'Điều hành viên' : 'Người dùng'}</p>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <button className="action-btn" onClick={() => setTrangHienTai('profile')}>
                  👤 Xem Profile
                </button>
                {(nguoiDung?.vaiTro === 'admin' || nguoiDung?.vaiTro === 'moderator') && (
                  <>
                    <button className="action-btn" onClick={() => setTrangHienTai('quan-ly-user')}>
                      👥 Quản lý User
                    </button>
                    <button className="action-btn" onClick={() => setTrangHienTai('activity-logs')}>
                      📊 Activity Logs
                    </button>
                  </>
                )}
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
            {(nguoiDung?.vaiTro === 'admin' || nguoiDung?.vaiTro === 'moderator') && (
              <>
                <button 
                  className={trangHienTai === 'quan-ly-user' ? 'nav-btn active' : 'nav-btn'}
                  onClick={() => setTrangHienTai('quan-ly-user')}
                >
                  👥 Quản lý User
                </button>
                <button 
                  className={trangHienTai === 'activity-logs' ? 'nav-btn active' : 'nav-btn'}
                  onClick={() => setTrangHienTai('activity-logs')}
                >
                  📊 Activity Logs
                </button>
              </>
            )}
          </nav>

          <div className="user-menu">
            <div className="user-info">
              <span className="user-name">{nguoiDung?.hoTen}</span>
              <span className="user-role">
                {nguoiDung?.vaiTro === 'admin' ? '👑 Admin' : nguoiDung?.vaiTro === 'moderator' ? '🛡️ Moderator' : '👤 User'}
              </span>
            </div>
            <button className="btn-logout" onClick={handleDangXuat}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {renderNoiDung()}
      </main>
    </div>
  );
}

export default DashboardPage;

