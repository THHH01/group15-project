import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function Profile() {
  const [nguoiDung, setNguoiDung] = useState(null);
  const [dangTaiDuLieu, setDangTaiDuLieu] = useState(true);
  const [dangChinhSua, setDangChinhSua] = useState(false);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [thongBao, setThongBao] = useState({ loai: '', noiDung: '' });
  
  const [formCapNhat, setFormCapNhat] = useState({
    hoTen: '',
    email: ''
  });

  // State cho avatar upload
  const [dangUploadAvatar, setDangUploadAvatar] = useState(false);
  const [fileAvatar, setFileAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setThongBao({ loai: 'loi', noiDung: 'Vui lòng đăng nhập để xem thông tin cá nhân.' });
      setDangTaiDuLieu(false);
      return;
    }
    taiThongTinProfile();
  }, [token]);

  const taiThongTinProfile = async () => {
    try {
      setDangTaiDuLieu(true);
      const response = await axios.get(`${API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNguoiDung(response.data.nguoiDung);
      setFormCapNhat({
        hoTen: response.data.nguoiDung.hoTen,
        email: response.data.nguoiDung.email
      });
      setThongBao({ loai: '', noiDung: '' });
    } catch (error) {
      const message = error?.response?.data?.thongBao || 'Không thể tải thông tin. Vui lòng thử lại.';
      setThongBao({ loai: 'loi', noiDung: message });
      
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nguoiDung');
      }
    } finally {
      setDangTaiDuLieu(false);
    }
  };

  const handleThayDoi = (event) => {
    const { name, value } = event.target;
    setFormCapNhat((prev) => ({ ...prev, [name]: value }));
  };

  const handleCapNhat = async (event) => {
    event.preventDefault();
    setDangXuLy(true);
    setThongBao({ loai: '', noiDung: '' });

    try {
      const response = await axios.put(
        `${API_URL}/api/profile`,
        formCapNhat,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setNguoiDung(response.data.nguoiDung);
      setFormCapNhat({
        hoTen: response.data.nguoiDung.hoTen,
        email: response.data.nguoiDung.email
      });
      setThongBao({ loai: 'thanh-cong', noiDung: response.data.thongBao });
      setDangChinhSua(false);

      // Cập nhật lại localStorage nếu có
      const storedUser = localStorage.getItem('nguoiDung');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.hoTen = response.data.nguoiDung.hoTen;
        userData.email = response.data.nguoiDung.email;
        localStorage.setItem('nguoiDung', JSON.stringify(userData));
      }
    } catch (error) {
      const message = error?.response?.data?.thongBao || 'Không thể cập nhật thông tin. Vui lòng thử lại.';
      setThongBao({ loai: 'loi', noiDung: message });
    } finally {
      setDangXuLy(false);
    }
  };

  const handleHuy = () => {
    if (nguoiDung) {
      setFormCapNhat({
        hoTen: nguoiDung.hoTen,
        email: nguoiDung.email
      });
    }
    setDangChinhSua(false);
    setThongBao({ loai: '', noiDung: '' });
  };

  // Xử lý chọn file avatar
  const handleChonAvatar = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      setThongBao({ loai: 'loi', noiDung: 'Vui lòng chọn file ảnh (jpg, png, gif, webp).' });
      return;
    }

    // Kiểm tra kích thước (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setThongBao({ loai: 'loi', noiDung: 'Kích thước ảnh tối đa 5MB.' });
      return;
    }

    setFileAvatar(file);

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload avatar lên server
  const handleUploadAvatar = async () => {
    if (!fileAvatar) {
      setThongBao({ loai: 'loi', noiDung: 'Vui lòng chọn ảnh trước.' });
      return;
    }

    setDangUploadAvatar(true);
    setThongBao({ loai: '', noiDung: '' });

    try {
      const formData = new FormData();
      formData.append('avatar', fileAvatar);

      const response = await axios.post(
        `${API_URL}/api/upload/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Cập nhật avatar trong state
      setNguoiDung((prev) => ({
        ...prev,
        avatar: response.data.avatar
      }));

      // Cập nhật localStorage
      const storedUser = localStorage.getItem('nguoiDung');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.avatar = response.data.avatar;
        localStorage.setItem('nguoiDung', JSON.stringify(userData));
      }

      setThongBao({ loai: 'thanh-cong', noiDung: response.data.thongBao });
      setFileAvatar(null);
      setPreviewAvatar(null);

      // Reload trang sau 1 giây để cập nhật avatar ở HomePage
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      const message = error?.response?.data?.thongBao || 'Không thể upload avatar. Vui lòng thử lại.';
      setThongBao({ loai: 'loi', noiDung: message });
    } finally {
      setDangUploadAvatar(false);
    }
  };

  // Hủy chọn avatar
  const handleHuyChonAvatar = () => {
    setFileAvatar(null);
    setPreviewAvatar(null);
  };

  if (dangTaiDuLieu) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="dang-tai">Đang tải thông tin...</div>
        </div>
      </div>
    );
  }

  if (!token || !nguoiDung) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="thong-bao loi">{thongBao.noiDung}</div>
          <p>
            <a href="/">Quay lại trang đăng nhập</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">Thông tin cá nhân</h1>

        {thongBao.noiDung && (
          <div className={`thong-bao ${thongBao.loai}`}>{thongBao.noiDung}</div>
        )}

        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-display">
            {previewAvatar ? (
              <img src={previewAvatar} alt="Preview" className="avatar-img preview" />
            ) : nguoiDung.avatar ? (
              <img src={nguoiDung.avatar} alt="Avatar" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                {nguoiDung.hoTen?.charAt(0).toUpperCase() || '👤'}
              </div>
            )}
          </div>

          <div className="avatar-actions">
            <input
              type="file"
              id="avatar-input"
              accept="image/*"
              onChange={handleChonAvatar}
              style={{ display: 'none' }}
            />
            
            {!fileAvatar ? (
              <label htmlFor="avatar-input" className="btn btn-upload">
                📷 Chọn ảnh
              </label>
            ) : (
              <div className="avatar-upload-controls">
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={handleUploadAvatar}
                  disabled={dangUploadAvatar}
                >
                  {dangUploadAvatar ? '⏳ Đang upload...' : '✅ Upload'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleHuyChonAvatar}
                  disabled={dangUploadAvatar}
                >
                  Hủy
                </button>
              </div>
            )}
            
            <p className="avatar-hint">Tối đa 5MB (jpg, png, gif, webp)</p>
          </div>
        </div>

        {!dangChinhSua ? (
          <div className="thong-tin-xem">
            <div className="info-item">
              <span className="label">Họ và tên:</span>
              <span className="value">{nguoiDung.hoTen}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{nguoiDung.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Vai trò:</span>
              <span className="value badge">{nguoiDung.vaiTro}</span>
            </div>
            <div className="info-item">
              <span className="label">Tạo lúc:</span>
              <span className="value">
                {new Date(nguoiDung.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setDangChinhSua(true)}
            >
              Chỉnh sửa thông tin
            </button>
          </div>
        ) : (
          <form className="form-cap-nhat" onSubmit={handleCapNhat}>
            <div className="form-group">
              <label htmlFor="hoTen">Họ và tên</label>
              <input
                id="hoTen"
                name="hoTen"
                type="text"
                value={formCapNhat.hoTen}
                onChange={handleThayDoi}
                minLength={2}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formCapNhat.email}
                onChange={handleThayDoi}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-success"
                disabled={dangXuLy}
              >
                {dangXuLy ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleHuy}
                disabled={dangXuLy}
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;

