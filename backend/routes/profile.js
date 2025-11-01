const express = require('express');
const { xemProfile, capNhatProfile } = require('../controllers/profileController');
const { xacThucToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', xacThucToken, xemProfile);
router.put('/', xacThucToken, capNhatProfile);

module.exports = router;

