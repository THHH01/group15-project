// routes/user.js
const express = require('express');
const router = express.Router();
const { getUsers, addUser } = require('../controllers/userController');

// Định nghĩa route
router.get('/users', getUsers);
router.post('/users', addUser);

module.exports = router;
