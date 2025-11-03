const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/User');

// Lazy load Cloudinary (chỉ load khi cần)
let cloudinary = null;
const initCloudinary = () => {
  if (cloudinary) return cloudinary;
  
  cloudinary = require('cloudinary').v2;
  
  // Cấu hình Cloudinary
  if (process.env.CLOUDINARY_URL) {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const matches = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
    
    if (matches) {
      cloudinary.config({
        cloud_name: matches[3],
        api_key: matches[1],
        api_secret: matches[2]
      });
    }
  } else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }
  
  return cloudinary;
};

// Cấu hình Multer (lưu file tạm trong memory)
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  // Chỉ chấp nhận file ảnh
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh định dạng: JPG, PNG, GIF, WEBP'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB (tăng lên vì sẽ resize)
  }
});

// Middleware xử lý upload
const uploadMiddleware = upload.single('avatar');

// Hàm xử lý resize ảnh với Sharp
const resizeImage = async (buffer, options = {}) => {
  const {
    width = 400,
    height = 400,
    quality = 90,
    format = 'jpeg'
  } = options;

  try {
    const resizedBuffer = await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .toFormat(format, { quality })
      .toBuffer();

    return resizedBuffer;
  } catch (error) {
    console.error('Lỗi resize ảnh:', error);
    throw new Error('Không thể xử lý ảnh');
  }
};

// Hàm lấy metadata ảnh
const getImageMetadata = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size
    };
  } catch (error) {
    console.error('Lỗi lấy metadata:', error);
    return null;
  }
};

// POST /api/upload/avatar - Upload avatar với Sharp resize
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

    // Lấy metadata ảnh gốc
    const originalMetadata = await getImageMetadata(req.file.buffer);
    console.log('📸 Ảnh gốc:', originalMetadata);

    // Resize ảnh với Sharp
    console.log('🔄 Đang resize ảnh...');
    const resizedBuffer = await resizeImage(req.file.buffer, {
      width: 400,
      height: 400,
      quality: 90,
      format: 'jpeg'
    });

    const resizedMetadata = await getImageMetadata(resizedBuffer);
    console.log('✅ Ảnh đã resize:', resizedMetadata);

    // Lazy load và cấu hình Cloudinary
    let cloudinaryInstance;
    try {
      cloudinaryInstance = initCloudinary();
    } catch (cloudinaryError) {
      return res.status(500).json({ 
        thongBao: 'Chưa cấu hình dịch vụ upload ảnh. Vui lòng liên hệ quản trị viên.',
        chiTiet: cloudinaryError.message
      });
    }

    // Upload lên Cloudinary từ buffer đã resize
    console.log('☁️  Đang upload lên Cloudinary...');
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinaryInstance.uploader.upload_stream(
        {
          folder: 'user-avatars',
          public_id: `user_${req.nguoiDung.id}_${Date.now()}`,
          resource_type: 'image',
          format: 'jpg'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(resizedBuffer);
    });

    const result = await uploadPromise;
    console.log('✅ Upload thành công:', result.secure_url);

    // Cập nhật avatar URL vào database
    const nguoiDung = await User.findById(req.nguoiDung.id);
    
    // Xóa avatar cũ trên Cloudinary (nếu có)
    if (nguoiDung.avatar && nguoiDung.avatar.includes('cloudinary')) {
      try {
        const oldPublicId = nguoiDung.avatar
          .split('/')
          .slice(-2)
          .join('/')
          .split('.')[0];
        await cloudinaryInstance.uploader.destroy(oldPublicId);
        console.log('🗑️  Đã xóa avatar cũ');
      } catch (deleteError) {
        console.warn('⚠️  Không thể xóa avatar cũ:', deleteError.message);
      }
    }

    nguoiDung.avatar = result.secure_url;
    await nguoiDung.save();

    return res.status(200).json({
      thongBao: 'Upload avatar thành công!',
      avatar: result.secure_url,
      metadata: {
        original: originalMetadata,
        resized: resizedMetadata,
        cloudinary: {
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes
        }
      },
      nguoiDung: nguoiDung.toJSON()
    });

  } catch (error) {
    console.error('❌ Lỗi upload avatar:', error);
    return res.status(500).json({ 
      thongBao: 'Không thể upload avatar.', 
      chiTiet: error.message 
    });
  }
};

// POST /api/upload/avatar-multiple - Upload nhiều kích thước
const uploadAvatarMultiple = async (req, res) => {
  try {
    if (!req.nguoiDung) {
      return res.status(401).json({ thongBao: 'Vui lòng đăng nhập.' });
    }

    if (!req.file) {
      return res.status(400).json({ thongBao: 'Vui lòng chọn file ảnh.' });
    }

    // Lazy load và cấu hình Cloudinary
    let cloudinaryInstance;
    try {
      cloudinaryInstance = initCloudinary();
    } catch (cloudinaryError) {
      return res.status(500).json({ 
        thongBao: 'Chưa cấu hình dịch vụ upload ảnh. Vui lòng liên hệ quản trị viên.',
        chiTiet: cloudinaryError.message
      });
    }

    // Tạo 3 kích thước: thumbnail, medium, large
    const sizes = [
      { name: 'thumbnail', width: 100, height: 100 },
      { name: 'medium', width: 400, height: 400 },
      { name: 'large', width: 800, height: 800 }
    ];

    const uploadPromises = sizes.map(async (size) => {
      const resizedBuffer = await resizeImage(req.file.buffer, {
        width: size.width,
        height: size.height,
        quality: 90
      });

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinaryInstance.uploader.upload_stream(
          {
            folder: `user-avatars/${size.name}`,
            public_id: `user_${req.nguoiDung.id}_${size.name}_${Date.now()}`,
            resource_type: 'image'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({ size: size.name, url: result.secure_url });
          }
        );
        uploadStream.end(resizedBuffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    // Lưu URL medium làm avatar chính
    const mediumUrl = results.find(r => r.size === 'medium')?.url;
    const nguoiDung = await User.findById(req.nguoiDung.id);
    nguoiDung.avatar = mediumUrl;
    await nguoiDung.save();

    return res.status(200).json({
      thongBao: 'Upload thành công!',
      avatars: results,
      nguoiDung: nguoiDung.toJSON()
    });

  } catch (error) {
    console.error('Lỗi upload multiple:', error);
    return res.status(500).json({ 
      thongBao: 'Không thể upload ảnh.', 
      chiTiet: error.message 
    });
  }
};

module.exports = { 
  uploadAvatar, 
  uploadAvatarMultiple,
  uploadMiddleware,
  resizeImage,
  getImageMetadata
};
