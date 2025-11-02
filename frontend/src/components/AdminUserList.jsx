import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import './AdminUserList.css';

function AdminUserList() {
  const [danhSachUser, setDanhSachUser] = useState([]);
  const [dangTaiDuLieu, setDangTaiDuLieu] = useState(true);
  const [thongBao, setThongBao] = useState({ loai: '', noiDung: '' });
  const [dangXoa, setDangXoa] = useState(null);

  const accessToken = localStorage.getItem('accessToken');
  const nguoiDungHienTai = JSON.parse(localStorage.getItem('nguoiDung') || '{}');

  useEffect(() => {
    if (!accessToken) {
      setThongBao({ loai: 'loi', noiDung: 'Vui lòng đăng nhập để tiếp tục.' });
      setDangTaiDuLieu(false);
      return;
    }

    if (nguoiDungHienTai?.vaiTro !== 'admin') {
      setThongBao({ loai: 'loi', noiDung: 'Bạn không có quyền truy cập trang này. Chỉ Admin mới được phép.' });
      setDangTaiDuLieu(false);
      return;
    }

    taiDanhSachUser();
  }, [accessToken]);

  const taiDanhSachUser = async () => {
    try {
      setDangTaiDuLieu(true);
      const response = await axiosInstance.get('/api/users');

      setDanhSachUser(response.data.danhSach || []);
      setThongBao({ loai: '', noiDung: '' });
    } catch (error) {
      const message = error?.response?.data?.thongBao || 'Không thể tải danh sách người dùng.';
      setThongBao({ loai: 'loi', noiDung: message });

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('nguoiDung');
          window.location.reload();
        }, 2000);
      }
    } finally {
      setDangTaiDuLieu(false);
    }
  };

  const handleXoaUser = async (userId, hoTen) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${hoTen}"?`)) {
      return;
    }

    try {
      setDangXoa(userId);
      await axiosInstance.delete(`/api/users/${userId}`);

      setThongBao({ loai: 'thanh-cong', noiDung: `Đã xóa người dùng "${hoTen}" thành công.` });
      
      // Cập nhật danh sách
      setDanhSachUser(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      const message = error?.response?.data?.thongBao || 'Không thể xóa người dùng.';
      setThongBao({ loai: 'loi', noiDung: message });
    } finally {
      setDangXoa(null);
    }
  };

  if (dangTaiDuLieu) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <div className="dang-tai">Đang tải danh sách người dùng...</div>
        </div>
      </div>
    );
  }

  if (nguoiDungHienTai?.vaiTro !== 'admin' || !accessToken) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <div className="thong-bao loi">{thongBao.noiDung}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">
          <span className="icon">👥</span>
          Quản lý người dùng
        </h1>
      </div>

      <div className="admin-info-panel">
        <div className="welcome-section">
          <span className="welcome-icon">👋</span>
          <div className="welcome-content">
            <h2 className="welcome-title">Xin chào, {nguoiDungHienTai?.hoTen || 'Admin'}!</h2>
            <p className="welcome-subtitle">
              Bạn đang quản lý <strong>{danhSachUser.length}</strong> người dùng trong hệ thống
            </p>
          </div>
        </div>
        <div className="info-divider"></div>
        <div className="last-update">
          <span className="update-icon">🕐</span>
          <span className="update-text">
            Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')} - {new Date().toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      {thongBao.noiDung && (
        <div className={`thong-bao ${thongBao.loai}`}>{thongBao.noiDung}</div>
      )}

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {danhSachUser.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  Không có người dùng nào
                </td>
              </tr>
            ) : (
              danhSachUser.map((user, index) => (
                <tr key={user._id} className={user._id === nguoiDungHienTai?.id ? 'current-user' : ''}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="user-name">
                      {user.hoTen || user.name || user.email.split('@')[0]}
                      {user._id === nguoiDungHienTai?.id && (
                        <span className="badge-current">Bạn</span>
                      )}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.vaiTro}`}>
                      {user.vaiTro === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleXoaUser(user._id, user.hoTen)}
                      disabled={dangXoa === user._id}
                    >
                      {dangXoa === user._id ? '⏳ Đang xóa...' : '🗑️ Xóa'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUserList;

