import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './App.css';

const MAC_DINH_API = 'http://localhost:3000';

function App() {
  const baseURL = useMemo(
    () => process.env.REACT_APP_API_URL || MAC_DINH_API,
    []
  );

  const [hienThiDangKy, setHienThiDangKy] = useState(false);
  const [formDangKy, setFormDangKy] = useState({ hoTen: '', email: '', matKhau: '' });
  const [formDangNhap, setFormDangNhap] = useState({ email: '', matKhau: '' });
  const [thongBaoDangKy, setThongBaoDangKy] = useState('');
  const [thongBaoDangNhap, setThongBaoDangNhap] = useState('');
  const [dangKyDangXuLy, setDangKyDangXuLy] = useState(false);
  const [dangNhapDangXuLy, setDangNhapDangXuLy] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [nguoiDung, setNguoiDung] = useState(() => {
    const luuTru = localStorage.getItem('nguoiDung');
    return luuTru ? JSON.parse(luuTru) : null;
  });

  const client = useMemo(
    () => axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } }),
    [baseURL]
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (nguoiDung) {
      localStorage.setItem('nguoiDung', JSON.stringify(nguoiDung));
    } else {
      localStorage.removeItem('nguoiDung');
    }
  }, [nguoiDung]);

  const handleThayDoiDangKy = (event) => {
    const { name, value } = event.target;
    setFormDangKy((prev) => ({ ...prev, [name]: value }));
  };

  const handleThayDoiDangNhap = (event) => {
    const { name, value } = event.target;
    setFormDangNhap((prev) => ({ ...prev, [name]: value }));
  };

  const taoThongBaoLoi = (error) => {
    const thongBao = error?.response?.data?.thongBao || 'Đã xảy ra lỗi. Vui lòng thử lại.';
    const chiTiet = error?.response?.data?.chiTiet;
    return chiTiet ? `${thongBao} (Chi tiết: ${chiTiet})` : thongBao;
  };

  const handleDangKy = async (event) => {
    event.preventDefault();
    setDangKyDangXuLy(true);
    setThongBaoDangKy('');

    try {
      const { data } = await client.post('/api/auth/signup', formDangKy);
      setThongBaoDangKy(data.thongBao);
      setFormDangKy({ hoTen: '', email: '', matKhau: '' });
    } catch (error) {
      setThongBaoDangKy(taoThongBaoLoi(error));
    } finally {
      setDangKyDangXuLy(false);
    }
  };

  const handleDangNhap = async (event) => {
    event.preventDefault();
    setDangNhapDangXuLy(true);
    setThongBaoDangNhap('');

    try {
      const { data } = await client.post('/api/auth/login', formDangNhap);
      setThongBaoDangNhap(data.thongBao);
      setToken(data.token);
      setNguoiDung(data.nguoiDung);
      setFormDangNhap({ email: '', matKhau: '' });
    } catch (error) {
      setThongBaoDangNhap(taoThongBaoLoi(error));
    } finally {
      setDangNhapDangXuLy(false);
    }
  };

  const handleDangXuat = async () => {
    try {
      await client.post(
        '/api/auth/logout',
        {},
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`
              }
            : undefined
        }
      );
    } catch (error) {
      console.warn('Đăng xuất phía server thất bại hoặc không cần thiết:', error);
    } finally {
      setToken('');
      setNguoiDung(null);
      setThongBaoDangNhap('Đăng xuất thành công! Token đã được xóa khỏi trình duyệt.');
    }
  };

  return (
    <div className="ung-dung">
      <header className="tieu-de">
        <h1>Hệ thống xác thực cơ bản</h1>
        <p>Đăng ký, đăng nhập và quản lý token JWT phía client.</p>
      </header>

      <main className="noi-dung-chinh">
        <section className="khoi-form-lon">
          <div className="chuyen-doi-tab">
            <button
              type="button"
              className={!hienThiDangKy ? 'tab-active' : 'tab-inactive'}
              onClick={() => {
                setHienThiDangKy(false);
                setThongBaoDangKy('');
                setThongBaoDangNhap('');
              }}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={hienThiDangKy ? 'tab-active' : 'tab-inactive'}
              onClick={() => {
                setHienThiDangKy(true);
                setThongBaoDangKy('');
                setThongBaoDangNhap('');
              }}
            >
              Đăng ký
            </button>
          </div>

          {hienThiDangKy ? (
            <>
              <h2>Đăng ký tài khoản</h2>
              <form className="form" onSubmit={handleDangKy}>
            <label htmlFor="hoTen">Họ và tên</label>
            <input
              id="hoTen"
              name="hoTen"
              type="text"
              placeholder="Ví dụ: Nguyễn Văn A"
              value={formDangKy.hoTen}
              onChange={handleThayDoiDangKy}
              required
            />

            <label htmlFor="emailDangKy">Email</label>
            <input
              id="emailDangKy"
              name="email"
              type="email"
              placeholder="email@vidu.com"
              value={formDangKy.email}
              onChange={handleThayDoiDangKy}
              required
            />

            <label htmlFor="matKhauDangKy">Mật khẩu</label>
            <input
              id="matKhauDangKy"
              name="matKhau"
              type="password"
              placeholder="Ít nhất 6 ký tự"
              value={formDangKy.matKhau}
              onChange={handleThayDoiDangKy}
              minLength={6}
              required
            />

                <button type="submit" disabled={dangKyDangXuLy}>
                  {dangKyDangXuLy ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
              </form>
              {thongBaoDangKy && <div className="thong-bao">{thongBaoDangKy}</div>}
            </>
          ) : (
            <>
              <h2>Đăng nhập</h2>
              <form className="form" onSubmit={handleDangNhap}>
            <label htmlFor="emailDangNhap">Email</label>
            <input
              id="emailDangNhap"
              name="email"
              type="email"
              placeholder="email@vidu.com"
              value={formDangNhap.email}
              onChange={handleThayDoiDangNhap}
              required
            />

            <label htmlFor="matKhauDangNhap">Mật khẩu</label>
            <input
              id="matKhauDangNhap"
              name="matKhau"
              type="password"
              placeholder="Nhập mật khẩu"
              value={formDangNhap.matKhau}
              onChange={handleThayDoiDangNhap}
              required
            />

                <button type="submit" disabled={dangNhapDangXuLy}>
                  {dangNhapDangXuLy ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
              </form>
              {thongBaoDangNhap && <div className="thong-bao">{thongBaoDangNhap}</div>}

              {token && (
                <div className="thong-tin-token">
                  <h3>Token JWT hiện tại</h3>
                  <p className="token">{token}</p>
                  {nguoiDung && (
                    <div className="nguoi-dung">
                      <h4>Thông tin người dùng</h4>
                      <ul>
                        <li>Họ tên: {nguoiDung.hoTen}</li>
                        <li>Email: {nguoiDung.email}</li>
                        <li>Vai trò: {nguoiDung.vaiTro}</li>
                      </ul>
                    </div>
                  )}
                  <button type="button" className="nut-dang-xuat" onClick={handleDangXuat}>
                    Đăng xuất & xóa token
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="chu-thich">
        <p>
          Lưu ý: Token được lưu trong <code>localStorage</code>. Hãy xóa token khi không sử dụng để đảm bảo an toàn.
        </p>
        <p className="duong-dan-api">API backend: {baseURL}</p>
      </footer>
    </div>
  );
}

export default App;
