const express = require('express');
const router = express.Router();
const caseTypeController = require('../controllers/caseTypeController');
const { authenticate, authorize } = require('../../../middleware/auth');

// 所有路由都需要認證
router.use(authenticate);

// 取得所有案件類型
router.get('/', caseTypeController.getCaseTypes);

// 取得案件類型統計
router.get('/stats', caseTypeController.getCaseTypeStats);

// 取得單一案件類型
router.get('/:id', caseTypeController.getCaseTypeById);

// 新增案件類型 (管理者)
router.post('/', authorize('super_admin', 'admin'), caseTypeController.createCaseType);

// 更新案件類型 (管理者)
router.put('/:id', authorize('super_admin', 'admin'), caseTypeController.updateCaseType);

// 刪除案件類型 (管理者)
router.delete('/:id', authorize('super_admin', 'admin'), caseTypeController.deleteCaseType);

module.exports = router;
