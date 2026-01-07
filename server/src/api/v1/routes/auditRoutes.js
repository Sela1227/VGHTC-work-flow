const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate, authorize } = require('../../../middleware/auth');

// 所有路由都需要管理者權限
router.use(authenticate);
router.use(authorize('super_admin', 'admin'));

// 查詢日誌
router.get('/logs', auditController.getLogs);

// 取得特定實體歷史
router.get('/entity/:type/:id', auditController.getEntityHistory);

// 統計
router.get('/stats', auditController.getStats);

module.exports = router;
