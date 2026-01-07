const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const caseRoutes = require('./caseRoutes');
const pointsRoutes = require('./pointsRoutes');
const caseTypeRoutes = require('./caseTypeRoutes');
const reportRoutes = require('./reportRoutes');

// 認證
router.use('/auth', authRoutes);

// 使用者
router.use('/users', userRoutes);

// 案件
router.use('/cases', caseRoutes);

// 點數
router.use('/points', pointsRoutes);

// 案件類型
router.use('/case-types', caseTypeRoutes);

// 報表
router.use('/reports', reportRoutes);

// API 資訊
router.get('/', (req, res) => {
  res.json({
    name: '臺中榮總放射腫瘤科劑量室工作分配系統 API',
    version: 'v1',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      cases: '/api/v1/cases',
      points: '/api/v1/points',
      caseTypes: '/api/v1/case-types',
      reports: '/api/v1/reports',
    },
  });
});

module.exports = router;
