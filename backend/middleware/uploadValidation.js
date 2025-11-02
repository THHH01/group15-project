// Middleware validate file upload

const validateImageUpload = (req, res, next) => {
  // Kiểm tra có file không
  if (!req.file) {
    return res.status(400).json({ 
      thongBao: 'Vui lòng chọn file ảnh để upload.' 
    });
  }

  // Kiểm tra mimetype
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimes.includes(req.file.mimetype)) {
    return res.status(400).json({ 
      thongBao: 'Định dạng file không hợp lệ. Chỉ chấp nhận: JPG, PNG, GIF, WEBP' 
    });
  }

  // Kiểm tra kích thước file (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (req.file.size > maxSize) {
    return res.status(400).json({ 
      thongBao: `Kích thước file quá lớn. Tối đa ${maxSize / (1024 * 1024)}MB` 
    });
  }

  // Kiểm tra buffer
  if (!req.file.buffer || req.file.buffer.length === 0) {
    return res.status(400).json({ 
      thongBao: 'File ảnh không hợp lệ hoặc bị hỏng.' 
    });
  }

  next();
};

// Middleware log upload info
const logUploadInfo = (req, res, next) => {
  if (req.file) {
    console.log('📤 Upload Request:', {
      user: req.nguoiDung?.email || 'Unknown',
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

module.exports = {
  validateImageUpload,
  logUploadInfo
};

