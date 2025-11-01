const express = require('express');
const { dangKy, dangNhap, dangXuat } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', dangKy);
router.post('/login', dangNhap);
router.post('/logout', dangXuat);

module.exports = router;

