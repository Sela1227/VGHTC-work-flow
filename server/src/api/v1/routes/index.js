const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');

// 認證路由
router.use('/auth', authRoutes);

// API 資訊
router.get('/', (req, res) => {
  res.json({
    name: '臺中榮總放射腫瘤科劑量室工作分配系統 API',
    version: 'v1',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users (coming soon)',
      cases: '/api/v1/cases (coming soon)',
      points: '/api/v1/points (coming soon)',
    },
  });
});

module.exports = router;
