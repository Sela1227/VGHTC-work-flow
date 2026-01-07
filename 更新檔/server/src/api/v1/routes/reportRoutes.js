const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../../../middleware/auth');

// 所有路由都需要認證
router.use(authenticate);

// 儀表板統計
router.get('/dashboard', reportController.getDashboardStats);

// 月報表（管理者）
router.get('/monthly', authorize('super_admin', 'admin'), reportController.getMonthlyReport);

// 個人統計
router.get('/personal/:userId?', reportController.getPersonalStats);

// 可用月份列表
router.get('/months', reportController.getAvailableMonths);

// 匯出資料（管理者）
router.get('/export', authorize('super_admin', 'admin'), reportController.getExportData);

module.exports = router;
