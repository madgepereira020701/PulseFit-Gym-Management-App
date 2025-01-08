const express = require('express');
const { userRegister, userLogin } = require('./Users/controllers/AuthController');


const router = express.Router();

// Register route
router.post('/register', userRegister);

// Login route
router.post('/login', userLogin);

module.exports = router;
