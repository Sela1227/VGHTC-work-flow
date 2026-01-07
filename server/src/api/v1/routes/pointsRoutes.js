const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/pointsController');
const { authenticate, authorize } = require('../../../middleware/auth');

// 所有路由都需要認證
router.use(authenticate);

// 取得我的當月點數
router.get('/current', pointsController.getCurrentPoints);

// 取得所有人當月點數 (管理者)
router.get('/all', authorize('super_admin', 'admin'), pointsController.getAllCurrentPoints);

// 取得點數歷史
router.get('/history/:userId?', pointsController.getPointsHistory);

// 取得調整記錄 (管理者)
router.get('/adjustments', authorize('super_admin', 'admin'), pointsController.getAdjustments);

// 點數調整 (管理者)
router.post('/adjust', authorize('super_admin', 'admin'), pointsController.adjustPoints);

// 月初重置 (管理者)
router.post('/monthly-reset', authorize('super_admin', 'admin'), pointsController.monthlyReset);

module.exports = router;
