import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Async thunks
export const dangKy = createAsyncThunk(
  'auth/dangKy',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/auth/signup`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { thongBao: 'Lỗi đăng ký' });
    }
  }
);

export const dangNhap = createAsyncThunk(
  'auth/dangNhap',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/auth/login`, credentials);
      // Lưu tokens vào localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('nguoiDung', JSON.stringify(response.data.nguoiDung));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { thongBao: 'Lỗi đăng nhập' });
    }
  }
);

export const dangXuat = createAsyncThunk(
  'auth/dangXuat',
  async (_, { rejectWithValue, getState }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');
      
      if (refreshToken && accessToken) {
        await axios.post(
          `${baseURL}/api/auth/logout`,
          { refreshToken },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
      }
      
      // Xóa tokens khỏi localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('nguoiDung');
      
      return null;
    } catch (error) {
      // Vẫn xóa tokens dù có lỗi
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('nguoiDung');
      return rejectWithValue(error.response?.data || { thongBao: 'Lỗi đăng xuất' });
    }
  }
);

export const lamMoiToken = createAsyncThunk(
  'auth/lamMoiToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Không có refresh token');
      }
      
      const response = await axios.post(`${baseURL}/api/auth/refresh`, { refreshToken });
      
      // Cập nhật tokens mới
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('nguoiDung', JSON.stringify(response.data.nguoiDung));
      
      return response.data;
    } catch (error) {
      // Xóa tokens nếu refresh thất bại
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('nguoiDung');
      return rejectWithValue(error.response?.data || { thongBao: 'Phiên đăng nhập hết hạn' });
    }
  }
);

// Initial state
const initialState = {
  nguoiDung: JSON.parse(localStorage.getItem('nguoiDung')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.nguoiDung = action.payload.nguoiDung;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    updateUser: (state, action) => {
      state.nguoiDung = { ...state.nguoiDung, ...action.payload };
      localStorage.setItem('nguoiDung', JSON.stringify(state.nguoiDung));
    }
  },
  extraReducers: (builder) => {
    // Đăng ký
    builder
      .addCase(dangKy.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(dangKy.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Không tự động đăng nhập sau khi đăng ký
      })
      .addCase(dangKy.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.thongBao || 'Đăng ký thất bại';
      });

    // Đăng nhập
    builder
      .addCase(dangNhap.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(dangNhap.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nguoiDung = action.payload.nguoiDung;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(dangNhap.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.thongBao || 'Đăng nhập thất bại';
        state.isAuthenticated = false;
      });

    // Đăng xuất
    builder
      .addCase(dangXuat.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(dangXuat.fulfilled, (state) => {
        state.isLoading = false;
        state.nguoiDung = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(dangXuat.rejected, (state) => {
        // Vẫn đăng xuất dù có lỗi
        state.isLoading = false;
        state.nguoiDung = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Làm mới token
    builder
      .addCase(lamMoiToken.fulfilled, (state, action) => {
        state.nguoiDung = action.payload.nguoiDung;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(lamMoiToken.rejected, (state) => {
        state.nguoiDung = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError, setCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;

