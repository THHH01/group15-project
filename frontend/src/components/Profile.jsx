import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import './Profile.css';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);

  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    if (!accessToken) {
      setThongBao({ loai: 'loi', noiDung: 'Vui lòng đăng nhập để xem thông tin cá nhân.' });
      setDangTaiDuLieu(false);
      return;
    }
    taiThongTinProfile();
  }, [accessToken]);

  const taiThongTinProfile = async () => {
    try {
      setDangTaiDuLieu(true);
      const response = await axiosInstance.get('/api/profile');

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
      const response = await axiosInstance.put('/api/profile', formCapNhat);

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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setThongBao({ loai: 'loi', noiDung: 'Vui lòng chọn file ảnh định dạng: JPG, PNG, GIF, WEBP.' });
      return;
    }

    // Kiểm tra kích thước (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setThongBao({ loai: 'loi', noiDung: 'Kích thước ảnh tối đa 10MB.' });
      return;
    }

    setFileAvatar(file);
    
    // Lưu thông tin file
    setFileInfo({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type
    });

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewAvatar(reader.result);
    };
    reader.readAsDataURL(file);
    
    setThongBao({ loai: '', noiDung: '' });
  };

  // Upload avatar lên server
  const handleUploadAvatar = async () => {
    if (!fileAvatar) {
      setThongBao({ loai: 'loi', noiDung: 'Vui lòng chọn ảnh trước.' });
      return;
    }

    setDangUploadAvatar(true);
    setUploadProgress(0);
    setThongBao({ loai: '', noiDung: '' });

    try {
      const formData = new FormData();
      formData.append('avatar', fileAvatar);

      const response = await axiosInstance.post('/api/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

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

      // Hiển thị thông tin metadata nếu có
      if (response.data.metadata) {
        console.log('📊 Upload Metadata:', response.data.metadata);
      }

      setThongBao({ loai: 'thanh-cong', noiDung: response.data.thongBao });
      setFileAvatar(null);
      setPreviewAvatar(null);
      setFileInfo(null);
      setUploadProgress(0);

      // Reload trang sau 1.5 giây để cập nhật avatar ở HomePage
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      const message = error?.response?.data?.thongBao || 'Không thể upload avatar. Vui lòng thử lại.';
      setThongBao({ loai: 'loi', noiDung: message });
      setUploadProgress(0);
    } finally {
      setDangUploadAvatar(false);
    }
  };

  // Hủy chọn avatar
  const handleHuyChonAvatar = () => {
    setFileAvatar(null);
    setPreviewAvatar(null);
    setFileInfo(null);
    setUploadProgress(0);
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

  if (!accessToken || !nguoiDung) {
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
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleChonAvatar}
              style={{ display: 'none' }}
            />
            
            {!fileAvatar ? (
              <label htmlFor="avatar-input" className="btn btn-upload">
                📷 Chọn ảnh
              </label>
            ) : (
              <>
                {fileInfo && (
                  <div className="file-info">
                    <p className="file-name">📄 {fileInfo.name}</p>
                    <p className="file-size">📊 {fileInfo.size}</p>
                  </div>
                )}
                
                {dangUploadAvatar && uploadProgress > 0 && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="progress-text">{uploadProgress}%</p>
                  </div>
                )}
                
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
              </>
            )}
            
            <p className="avatar-hint">Tối đa 10MB • JPG, PNG, GIF, WEBP • Tự động resize 400x400px</p>
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

