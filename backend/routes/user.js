const express = require('express');
const router = express.Router();
const { getUsers, addUser, deleteUser } = require('../controllers/userController');
const { xacThucToken } = require('../middleware/auth');
const { kiemTraAdmin, kiemTraAdminHoacChuSoHuu } = require('../middleware/rbac');

// GET /api/users - Lấy danh sách user (chỉ Admin)
router.get('/', xacThucToken, kiemTraAdmin, getUsers);

// POST /api/users - Thêm user mới (chỉ Admin)
router.post('/', xacThucToken, kiemTraAdmin, addUser);

// DELETE /api/users/:id - Xóa user (Admin hoặc chính user đó)
router.delete('/:id', xacThucToken, kiemTraAdminHoacChuSoHuu, deleteUser);

module.exports = router;
