const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');
const { authenticate, authorize } = require('../../../middleware/auth');

// 所有路由都需要管理者權限
router.use(authenticate);
router.use(authorize('super_admin', 'admin'));

// 取得匯入範本
router.get('/template', importController.getTemplate);

// 預覽匯入
router.post('/preview', importController.previewImport);

// 執行匯入
router.post('/execute', importController.executeImport);

module.exports = router;
