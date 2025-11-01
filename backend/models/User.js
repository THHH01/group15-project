const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    hoTen: {
      type: String,
      required: [true, 'Họ và tên là bắt buộc'],
      trim: true,
      minlength: [2, 'Họ và tên phải có ít nhất 2 ký tự']
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Định dạng email không hợp lệ']
    },
    matKhau: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
    },
    vaiTro: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('matKhau')) {
    return next();
  }

  try {
    const matKhauMaHoa = await bcrypt.hash(this.matKhau, 10);
    this.matKhau = matKhauMaHoa;
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.kiemTraMatKhau = function kiemTraMatKhau(matKhauNhap) {
  return bcrypt.compare(matKhauNhap, this.matKhau);
};

userSchema.methods.toJSON = function toJSON() {
  const userObject = this.toObject();
  delete userObject.matKhau;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);