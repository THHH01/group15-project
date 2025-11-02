const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    nguoiDungId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    thoiGianHetHan: {
      type: Date,
      required: true,
      index: true
    },
    daHuy: {
      type: Boolean,
      default: false
    },
    diaChi: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Tự động xóa token đã hết hạn sau 7 ngày
refreshTokenSchema.index({ thoiGianHetHan: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

// Method kiểm tra token còn hiệu lực
refreshTokenSchema.methods.conHieuLuc = function () {
  return !this.daHuy && this.thoiGianHetHan > new Date();
};

// Static method để làm sạch token hết hạn
refreshTokenSchema.statics.lamSachTokenHetHan = async function () {
  const now = new Date();
  const result = await this.deleteMany({
    $or: [{ thoiGianHetHan: { $lt: now } }, { daHuy: true }]
  });
  return result.deletedCount;
};

// Static method để hủy tất cả token của user
refreshTokenSchema.statics.huyTatCaTokenCuaUser = async function (nguoiDungId) {
  const result = await this.updateMany(
    { nguoiDungId, daHuy: false },
    { $set: { daHuy: true } }
  );
  return result.modifiedCount;
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);

