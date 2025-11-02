import axios from 'axios';

const MAC_DINH_API = 'http://localhost:3000';
const baseURL = process.env.REACT_APP_API_URL || MAC_DINH_API;

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

// Biến để theo dõi việc refresh token
let dangRefresh = false;
let cacRequestChoDoi = [];

// Request interceptor: Thêm access token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Tự động refresh token khi hết hạn
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Nếu đang refresh, đợi
      if (dangRefresh) {
        return new Promise((resolve, reject) => {
          cacRequestChoDoi.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      dangRefresh = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('Không có refresh token');
        }

        // Gọi API refresh token
        const { data } = await axios.post(`${baseURL}/api/auth/refresh`, {
          refreshToken
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;

        // Lưu token mới
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Cập nhật header cho request ban đầu
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Xử lý các request đang chờ
        cacRequestChoDoi.forEach(({ resolve }) => resolve(newAccessToken));
        cacRequestChoDoi = [];

        dangRefresh = false;

        // Thử lại request ban đầu
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại -> đăng xuất
        cacRequestChoDoi.forEach(({ reject }) => reject(refreshError));
        cacRequestChoDoi = [];
        dangRefresh = false;

        // Xóa token và chuyển về trang login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('nguoiDung');

        // Reload trang để quay về form login
        window.location.href = '/';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

