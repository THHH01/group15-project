# 🏠 Hệ Thống Quản Lý Người Dùng - Group 15

## 📝 Mô tả dự án

Dự án **Hệ thống quản lý người dùng** là một ứng dụng full-stack với các chức năng quản trị user, xác thực và phân quyền. Hệ thống được xây dựng bằng **Node.js** (Backend) và **React.js** (Frontend), sử dụng MongoDB để lưu trữ dữ liệu.

### ✨ Các tính năng chính:

1. **🔐 Xác thực cơ bản**: Đăng ký, đăng nhập, đăng xuất với JWT
2. **👤 Quản lý thông tin cá nhân**: Xem và cập nhật profile, upload avatar
3. **👑 Quản lý người dùng (Admin)**: Danh sách users, xóa user, phân quyền RBAC
4. **🔑 Tính năng nâng cao**: Quên mật khẩu, đặt lại mật khẩu, upload avatar lên Cloudinary

---

## 👥 Thành viên nhóm và phân công công việc

| STT | Họ và tên | MSSV | Email | Phụ trách |
|-----|-----------|------|-------|-----------|
| 1 | Phan Thị Quế Trân | 224468 | tran224468@student.nctu.edu.vn | 🔧 **Backend** |
| 2 | Trương Tố Trinh | 226141 | trinh226141@student.nctu.edu.vn | 🎨 **Frontend** |
| 3 | Nguyễn Thái Học | 222756 | hoc222756@student.nctu.edu.vn | 🗄️ **Database** |

---

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** + **Express.js** - Framework web
- **MongoDB** + **Mongoose** - Cơ sở dữ liệu
- **JWT** - Xác thực người dùng
- **bcryptjs** - Mã hóa mật khẩu
- **Cloudinary** - Lưu trữ ảnh
- **Nodemailer** - Gửi email
- **Multer** - Upload file

### Frontend
- **React.js** - Framework UI
- **Axios** - HTTP client
- **CSS** - Styling

---

## ⚙️ Cài đặt và chạy dự án

### 1️⃣ Cài đặt Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env với nội dung:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_secret_key_here
PORT=3000
FRONTEND_URL=http://localhost:3001
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Chạy server (development mode)
npm run dev

# Hoặc chạy production
npm start
```

Backend sẽ chạy tại: `http://localhost:3000`

### 2️⃣ Cài đặt Frontend

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm start
```

Frontend sẽ chạy tại: `http://localhost:3001`

### 3️⃣ Cấu hình MongoDB

1. Tạo tài khoản tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster mới
3. Whitelist IP address (hoặc dùng `0.0.0.0/0` cho development)
4. Lấy connection string và thay vào `MONGODB_URI` trong `.env`

### 4️⃣ Cấu hình Cloudinary (Upload Avatar)

1. Tạo tài khoản tại [Cloudinary](https://cloudinary.com/)
2. Lấy credentials từ Dashboard
3. Copy `Cloudinary URL` vào `.env`:

```
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

---

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Profile
- `GET /api/profile` - Lấy thông tin profile
- `PUT /api/profile` - Cập nhật profile

### Users (Admin only)
- `GET /api/users` - Danh sách tất cả users
- `POST /api/users` - Thêm user mới (Admin)
- `DELETE /api/users/:id` - Xóa user

### Password
- `POST /api/password/forgot` - Yêu cầu reset password
- `POST /api/password/reset` - Đặt lại password với token

### Upload
- `POST /api/upload/avatar` - Upload avatar lên Cloudinary

---

## 🧪 Testing với Postman

Import các collection files từ `backend/postman/`:

1. `authentication.postman_collection.json` - Test authentication APIs
2. `admin-users.postman_collection.json` - Test admin features
3. `advanced-features.postman_collection.json` - Test advanced features

Tạo **Environment** trong Postman với:
- `base_url` = `http://localhost:3000`

---

## 📝 Các hoạt động

### Hoạt động 1: Authentication cơ bản
- ✅ Đăng ký (Sign Up) - kiểm tra email trùng, mã hóa mật khẩu (bcrypt)
- ✅ Đăng nhập (Login) - xác thực email/password, trả về JWT token
- ✅ Đăng xuất (Logout) - xóa token phía client

### Hoạt động 2: Quản lý thông tin cá nhân
- ✅ Cập nhật thông tin cá nhân (Update Profile)
- ✅ Xem thông tin cá nhân (View Profile)

### Hoạt động 3: Quản lý User (Admin)
- ✅ Danh sách người dùng (User List - Admin)
- ✅ Xóa tài khoản (Delete User - Admin hoặc tự xóa)
- ✅ Phân quyền (RBAC: User, Admin)

### Hoạt động 4: Tính năng nâng cao
- ✅ Quên mật khẩu (Forgot Password) - gửi token reset
- ✅ Đổi mật khẩu với token reset
- ✅ Upload Avatar (Cloudinary)

---

## 🔒 Bảo mật

- Mật khẩu được mã hóa bằng bcrypt
- JWT token xác thực người dùng
- Middleware RBAC phân quyền
- Reset password token có thời hạn (1 giờ)
- CORS được cấu hình đúng

---

## 📄 License

ISC

---

## 👨‍💻 Phát triển bởi Nhóm 15 - Trường Đại hoc Nam Cần Thơ 

© 2025 - Dự án môn học
