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
- `POST /api/auth/login` - Đăng nhập (trả về Access Token + Refresh Token)
- `POST /api/auth/refresh` - Làm mới Access Token bằng Refresh Token
- `POST /api/auth/logout` - Đăng xuất và revoke refresh token

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

### Roles & Permissions (Admin/Moderator) ⭐ NEW
- `GET /api/roles` - Lấy danh sách users theo role/status (Admin, Moderator)
- `GET /api/roles/thong-ke` - Thống kê users theo role và status (Admin, Moderator)
- `PUT /api/roles/:id/vai-tro` - Cập nhật vai trò user (Admin only)
- `PUT /api/roles/:id/trang-thai` - Cập nhật trạng thái user (Admin, Moderator)
- `PUT /api/roles/:id/quyen-han` - Cập nhật quyền hạn custom (Admin only)

---

## 🧪 Testing với Postman

Import các collection files từ `backend/postman/`:

1. `authentication.postman_collection.json` - Test authentication APIs
2. `admin-users.postman_collection.json` - Test admin features
3. `advanced-features.postman_collection.json` - Test advanced features
4. `rbac.postman_collection.json` - Test RBAC (User, Moderator, Admin)

Tạo **Environment** trong Postman với:
- `base_url` = `http://localhost:3000`

### Seed Data
Chạy script để tạo dữ liệu mẫu:
```bash
cd backend
node scripts/seedUsers.js
```

Tài khoản mẫu:
- **Admin:** admin@example.com / 123456
- **Moderator:** moderator@example.com / 123456
- **User:** user@example.com / 123456

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

### Hoạt động 5: Refresh Token & Session Management
- ✅ Access Token (thời hạn ngắn - 15 phút)
- ✅ Refresh Token (thời hạn dài - 7 ngày)
- ✅ API `/auth/refresh` - Làm mới token tự động
- ✅ Token Rotation - Refresh token được thay mới sau mỗi lần sử dụng
- ✅ Revoke Token - Hủy token khi logout
- ✅ Frontend tự động refresh token khi hết hạn (axios interceptor)

### Hoạt động 6: Advanced RBAC (Role-Based Access Control) ⭐ NEW
- ✅ 3 vai trò: User, Moderator, Admin
- ✅ Trạng thái tài khoản: Active, Suspended, Banned
- ✅ Quyền hạn tùy chỉnh (permissions array)
- ✅ Middleware `kiemTraVaiTro()` - Kiểm tra nhiều roles
- ✅ Middleware `kiemTraQuyenHan()` - Kiểm tra permissions cụ thể
- ✅ Middleware `kiemTraTrangThai()` - Kiểm tra trạng thái tài khoản
- ✅ API quản lý vai trò, trạng thái, quyền hạn
- ✅ Frontend hiển thị chức năng theo role (Admin/Moderator có thể quản lý users)
- ✅ Moderator có thể xem danh sách và khóa User (không khóa được Admin/Moderator)

---

## 🔒 Bảo mật

- Mật khẩu được mã hóa bằng bcrypt
- JWT Access Token (15 phút) + Refresh Token (7 ngày)
- Token Rotation - Refresh token tự động đổi mới
- Advanced RBAC - Phân quyền theo vai trò (User, Moderator, Admin) và permissions
- Kiểm tra trạng thái tài khoản (Active, Suspended, Banned)
- Moderator không thể khóa Admin/Moderator khác
- Reset password token có thời hạn (1 giờ)
- Axios interceptor tự động refresh token khi hết hạn
- CORS được cấu hình đúng

---

## 📄 License

ISC

---

## 👨‍💻 Phát triển bởi Nhóm 15 - Trường Đại hoc Nam Cần Thơ 

© 2025 - Dự án môn học
