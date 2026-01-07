const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const { authenticate, authorize } = require('../../../middleware/auth');

// 所有路由都需要認證
router.use(authenticate);

// 取得所有案件 (管理者)
router.get('/', authorize('super_admin', 'admin'), caseController.getCases);

// 取得我的案件
router.get('/my', caseController.getMyCases);

// 取得待確認的自主接案 (管理者)
router.get('/unconfirmed', authorize('super_admin', 'admin'), caseController.getUnconfirmedCases);

// 取得單一案件
router.get('/:id', caseController.getCaseById);

// 新增案件 (管理者)
router.post('/', authorize('super_admin', 'admin'), caseController.createCase);

// 自主接案 (同仁)
router.post('/self-assign', caseController.selfAssign);

// 更新案件
router.put('/:id', caseController.updateCase);

// 重新分配案件 (管理者)
router.put('/:id/assign', authorize('super_admin', 'admin'), caseController.reassignCase);

// 確認自主接案 (管理者)
router.put('/:id/confirm', authorize('super_admin', 'admin'), caseController.confirmCase);

// 完成案件
router.put('/:id/complete', caseController.completeCase);

// 刪除案件
router.delete('/:id', caseController.deleteCase);

module.exports = router;
