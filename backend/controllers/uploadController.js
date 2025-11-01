const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const User = require('../models/User');

// Cấu hình Cloudinary
// Hỗ trợ 2 cách config:
// 1. Dùng CLOUDINARY_URL (đơn giản hơn)
// 2. Dùng 3 biến riêng: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
if (process.env.CLOUDINARY_URL) {
  // Cloudinary tự động parse từ CLOUDINARY_URL
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Cấu hình Multer (lưu file tạm trong memory)
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  // Chỉ chấp nhận file ảnh
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
});

// Middleware xử lý upload
const uploadMiddleware = upload.single('avatar');

// POST /api/upload/avatar - Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    // Kiểm tra xem user đã đăng nhập chưa
    if (!req.nguoiDung) {
      return res.status(401).json({ thongBao: 'Vui lòng đăng nhập để upload avatar.' });
    }

    // Kiểm tra xem có file không
    if (!req.file) {
      return res.status(400).json({ thongBao: 'Vui lòng chọn file ảnh để upload.' });
    }

    // Kiểm tra cấu hình Cloudinary
    const hasCloudinaryUrl = process.env.CLOUDINARY_URL;
    const hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME && 
                                process.env.CLOUDINARY_API_KEY && 
                                process.env.CLOUDINARY_API_SECRET;
    
    if (!hasCloudinaryUrl && !hasCloudinaryConfig) {
      console.error('❌ Chưa cấu hình Cloudinary trong .env');
      return res.status(500).json({ 
        thongBao: 'Chưa cấu hình dịch vụ upload ảnh. Vui lòng liên hệ quản trị viên.' 
      });
    }

    // Upload lên Cloudinary từ buffer
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'user-avatars',
          public_id: `user_${req.nguoiDung._id}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    // Cập nhật avatar URL vào database
    const nguoiDung = await User.findById(req.nguoiDung._id);
    
    // Xóa avatar cũ trên Cloudinary (nếu có)
    if (nguoiDung.avatar && nguoiDung.avatar.includes('cloudinary')) {
      try {
        const publicId = nguoiDung.avatar
          .split('/')
          .slice(-2)
          .join('/')
          .split('.')[0];
        await cloudinary.uploader.destroy(`user-avatars/${publicId}`);
      } catch (deleteError) {
        console.warn('Không thể xóa avatar cũ:', deleteError);
      }
    }

    nguoiDung.avatar = result.secure_url;
    await nguoiDung.save();

    return res.status(200).json({
      thongBao: 'Upload avatar thành công!',
      avatar: result.secure_url,
      nguoiDung: nguoiDung.toJSON()
    });

  } catch (error) {
    console.error('Lỗi upload avatar:', error);
    return res.status(500).json({ 
      thongBao: 'Không thể upload avatar.', 
      chiTiet: error.message 
    });
  }
};

module.exports = { uploadAvatar, uploadMiddleware };

