const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const danhSachNguoiDungMau = [
  {
    hoTen: 'Admin Hệ Thống',
    email: 'admin@example.com',
    matKhau: '123456',
    vaiTro: 'admin',
    trangThai: 'active',
    quyenHan: ['*']
  },
  {
    hoTen: 'Moderator Nguyễn Văn A',
    email: 'moderator@example.com',
    matKhau: '123456',
    vaiTro: 'moderator',
    trangThai: 'active',
    quyenHan: [
      'xem_profile',
      'cap_nhat_profile',
      'upload_avatar',
      'xem_danh_sach_user',
      'khoa_user',
      'xoa_bai_viet'
    ]
  },
  {
    hoTen: 'User Trần Thị B',
    email: 'user@example.com',
    matKhau: '123456',
    vaiTro: 'user',
    trangThai: 'active',
    quyenHan: ['xem_profile', 'cap_nhat_profile', 'upload_avatar']
  },
  {
    hoTen: 'User Lê Văn C',
    email: 'user2@example.com',
    matKhau: '123456',
    vaiTro: 'user',
    trangThai: 'active',
    quyenHan: ['xem_profile', 'cap_nhat_profile', 'upload_avatar']
  },
  {
    hoTen: 'User Bị Khóa',
    email: 'suspended@example.com',
    matKhau: '123456',
    vaiTro: 'user',
    trangThai: 'suspended',
    quyenHan: []
  }
];

const seedUsers = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Xóa tất cả users cũ (nếu muốn reset)
    // await User.deleteMany({});
    // console.log('🗑️  Đã xóa tất cả users cũ');

    // Tạo users mới
    for (const userData of danhSachNguoiDungMau) {
      const existing = await User.findOne({ email: userData.email });
      
      if (existing) {
        console.log(`⚠️  User ${userData.email} đã tồn tại, bỏ qua...`);
        continue;
      }

      const user = await User.create(userData);
      console.log(`✅ Đã tạo user: ${user.email} (${user.vaiTro})`);
    }

    console.log('\n🎉 Seed dữ liệu thành công!');
    console.log('\n📋 Danh sách tài khoản:');
    console.log('-----------------------------------');
    console.log('Admin:     admin@example.com / 123456');
    console.log('Moderator: moderator@example.com / 123456');
    console.log('User:      user@example.com / 123456');
    console.log('User 2:    user2@example.com / 123456');
    console.log('Suspended: suspended@example.com / 123456');
    console.log('-----------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi seed dữ liệu:', error);
    process.exit(1);
  }
};

seedUsers();

