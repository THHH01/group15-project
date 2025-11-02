import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import './ActivityLogs.css';

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [dangTai, setDangTai] = useState(false);
  const [thongBao, setThongBao] = useState({ loai: '', noiDung: '' });
  const [filters, setFilters] = useState({
    hanhDong: '',
    trangThai: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState(null);
  const [tabHienTai, setTabHienTai] = useState('logs'); // 'logs' hoặc 'stats'

  const nguoiDungHienTai = JSON.parse(localStorage.getItem('nguoiDung') || '{}');

  useEffect(() => {
    if (tabHienTai === 'logs') {
      taiDanhSachLogs();
    } else {
      taiThongKe();
    }
  }, [filters, tabHienTai]);

  const taiDanhSachLogs = async () => {
    try {
      setDangTai(true);
      const queryParams = new URLSearchParams();
      if (filters.hanhDong) queryParams.append('hanhDong', filters.hanhDong);
      if (filters.trangThai) queryParams.append('trangThai', filters.trangThai);
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);

      const response = await axiosInstance.get(`/api/logs?${queryParams.toString()}`);
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
      setThongBao({ loai: '', noiDung: '' });
    } catch (error) {
      const msg = error?.response?.data?.thongBao || 'Không thể tải logs';
      setThongBao({ loai: 'loi', noiDung: msg });
    } finally {
      setDangTai(false);
    }
  };

  const taiThongKe = async () => {
    try {
      setDangTai(true);
      const response = await axiosInstance.get('/api/logs/stats');
      setStats(response.data.thongKe);
      setThongBao({ loai: '', noiDung: '' });
    } catch (error) {
      const msg = error?.response?.data?.thongBao || 'Không thể tải thống kê';
      setThongBao({ loai: 'loi', noiDung: msg });
    } finally {
      setDangTai(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const getHanhDongLabel = (hanhDong) => {
    const labels = {
      dang_nhap: '🔓 Đăng nhập',
      dang_xuat: '🔒 Đăng xuất',
      dang_ky: '📝 Đăng ký',
      cap_nhat_profile: '✏️ Cập nhật profile',
      doi_mat_khau: '🔑 Đổi mật khẩu',
      quen_mat_khau: '❓ Quên mật khẩu',
      reset_mat_khau: '🔄 Reset mật khẩu',
      upload_avatar: '📷 Upload avatar',
      xem_danh_sach_user: '👥 Xem danh sách user',
      xoa_user: '🗑️ Xóa user',
      cap_nhat_vai_tro: '👑 Cập nhật vai trò',
      cap_nhat_trang_thai: '⚡ Cập nhật trạng thái',
      cap_nhat_quyen_han: '🔐 Cập nhật quyền hạn',
      dang_nhap_that_bai: '❌ Đăng nhập thất bại',
      truy_cap_khong_duoc_phep: '🚫 Truy cập bị từ chối'
    };
    return labels[hanhDong] || hanhDong;
  };

  if (nguoiDungHienTai?.vaiTro !== 'admin' && nguoiDungHienTai?.vaiTro !== 'moderator') {
    return (
      <div className="logs-container">
        <div className="access-denied">
          <h2>🚫 Truy cập bị từ chối</h2>
          <p>Chỉ Admin và Moderator mới có quyền xem Activity Logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h1>📊 Activity Logs & Thống kê</h1>
        <p className="logs-subtitle">Theo dõi hoạt động người dùng và thống kê hệ thống</p>
      </div>

      {thongBao.noiDung && (
        <div className={`thong-bao ${thongBao.loai}`}>
          {thongBao.noiDung}
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab-btn ${tabHienTai === 'logs' ? 'active' : ''}`}
          onClick={() => setTabHienTai('logs')}
        >
          📋 Danh sách Logs
        </button>
        <button
          className={`tab-btn ${tabHienTai === 'stats' ? 'active' : ''}`}
          onClick={() => setTabHienTai('stats')}
        >
          📈 Thống kê
        </button>
      </div>

      {tabHienTai === 'logs' ? (
        <>
          <div className="filters">
            <select
              value={filters.hanhDong}
              onChange={(e) => handleFilterChange('hanhDong', e.target.value)}
            >
              <option value="">Tất cả hành động</option>
              <option value="dang_nhap">Đăng nhập</option>
              <option value="dang_xuat">Đăng xuất</option>
              <option value="dang_ky">Đăng ký</option>
              <option value="dang_nhap_that_bai">Đăng nhập thất bại</option>
              <option value="cap_nhat_profile">Cập nhật profile</option>
              <option value="upload_avatar">Upload avatar</option>
            </select>

            <select
              value={filters.trangThai}
              onChange={(e) => handleFilterChange('trangThai', e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="thanh_cong">Thành công</option>
              <option value="that_bai">Thất bại</option>
            </select>

            <button className="btn-refresh" onClick={taiDanhSachLogs}>
              🔄 Làm mới
            </button>
          </div>

          {dangTai ? (
            <div className="loading">⏳ Đang tải...</div>
          ) : (
            <>
              <div className="logs-table-wrapper">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Người dùng</th>
                      <th>Hành động</th>
                      <th>Mô tả</th>
                      <th>Trạng thái</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="no-data">Không có logs nào</td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log._id}>
                          <td className="time-cell">{formatDate(log.createdAt)}</td>
                          <td className="user-cell">
                            {log.nguoiDungId ? (
                              <>
                                <strong>{log.nguoiDungId.hoTen}</strong>
                                <br />
                                <small>{log.nguoiDungId.email}</small>
                              </>
                            ) : (
                              <span className="no-user">{log.email || 'N/A'}</span>
                            )}
                          </td>
                          <td className="action-cell">{getHanhDongLabel(log.hanhDong)}</td>
                          <td className="desc-cell">{log.moTa}</td>
                          <td>
                            <span className={`badge badge-${log.trangThai}`}>
                              {log.trangThai === 'thanh_cong' ? '✅ Thành công' : '❌ Thất bại'}
                            </span>
                          </td>
                          <td className="ip-cell">{log.diaChi || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn-page"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    ← Trước
                  </button>
                  <span className="page-info">
                    Trang {pagination.page} / {pagination.totalPages} (Tổng: {pagination.total} logs)
                  </span>
                  <button
                    className="btn-page"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="stats-container">
          {dangTai ? (
            <div className="loading">⏳ Đang tải thống kê...</div>
          ) : stats ? (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">{stats.tongSoLog}</div>
                  <div className="stat-label">Tổng số logs</div>
                </div>
                <div className="stat-card success">
                  <div className="stat-icon">✅</div>
                  <div className="stat-value">{stats.soLogThanhCong}</div>
                  <div className="stat-label">Thành công</div>
                </div>
                <div className="stat-card error">
                  <div className="stat-icon">❌</div>
                  <div className="stat-value">{stats.soLogThatBai}</div>
                  <div className="stat-label">Thất bại</div>
                </div>
                <div className="stat-card warning">
                  <div className="stat-icon">🔒</div>
                  <div className="stat-value">{stats.soLoginThatBai}</div>
                  <div className="stat-label">Login thất bại</div>
                </div>
              </div>

              <div className="stats-section">
                <h3>📈 Thống kê theo hành động</h3>
                <div className="action-stats">
                  {stats.thongKeHanhDong.map((item) => (
                    <div key={item._id} className="action-stat-item">
                      <span className="action-name">{getHanhDongLabel(item._id)}</span>
                      <span className="action-count">{item.soLuong}</span>
                    </div>
                  ))}
                </div>
              </div>

              {stats.topUsers && stats.topUsers.length > 0 && (
                <div className="stats-section">
                  <h3>👥 Top Users hoạt động</h3>
                  <div className="top-users">
                    {stats.topUsers.map((user, index) => (
                      <div key={user._id} className="top-user-item">
                        <span className="user-rank">#{index + 1}</span>
                        <div className="user-info">
                          <strong>{user.hoTen}</strong>
                          <small>{user.email}</small>
                        </div>
                        <span className="user-activity-count">{user.soLuong} hoạt động</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-data">Không có dữ liệu thống kê</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ActivityLogs;

