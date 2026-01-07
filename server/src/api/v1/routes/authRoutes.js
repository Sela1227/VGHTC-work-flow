const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../../../middleware/auth');

// 公開路由
router.post('/login', authController.login);

// 需要認證的路由
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/me', authenticate, authController.me);

module.exports = router;
