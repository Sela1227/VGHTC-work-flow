const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../../../middleware/auth');

// 所有路由都需要認證
router.use(authenticate);

// 取得所有使用者 (管理者)
router.get('/', authorize('super_admin', 'admin'), userController.getUsers);

// 取得單一使用者
router.get('/:id', authorize('super_admin', 'admin'), userController.getUserById);

// 新增使用者 (管理者)
router.post('/', authorize('super_admin', 'admin'), userController.createUser);

// 更新使用者 (管理者)
router.put('/:id', authorize('super_admin', 'admin'), userController.updateUser);

// 停用/啟用使用者 (管理者)
router.patch('/:id/toggle', authorize('super_admin', 'admin'), userController.toggleStatus);

// 刪除使用者 (管理者)
router.delete('/:id', authorize('super_admin', 'admin'), userController.deleteUser);

// 重設密碼 (管理者)
router.post('/:id/reset-password', authorize('super_admin', 'admin'), userController.resetPassword);

module.exports = router;
