const express = require('express');
const { dangKy, dangNhap, dangXuat, lamMoiToken } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', dangKy);
router.post('/login', dangNhap);
router.post('/logout', dangXuat);
router.post('/refresh', lamMoiToken);

module.exports = router;

