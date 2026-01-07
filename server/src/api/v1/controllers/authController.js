const authService = require('../../../services/authService');

class AuthController {
  // POST /api/v1/auth/login
  async login(req, res, next) {
    try {
      const { employeeId, password } = req.body;

      if (!employeeId || !password) {
        return res.status(400).json({
          success: false,
          error: { message: '請輸入帳號和密碼' },
        });
      }

      const result = await authService.login(employeeId, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/change-password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: { message: '請輸入目前密碼和新密碼' },
        });
      }

      if (newPassword.length < 4) {
        return res.status(400).json({
          success: false,
          error: { message: '新密碼至少需要 4 個字元' },
        });
      }

      const result = await authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/auth/me
  async me(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/logout
  async logout(req, res) {
    // JWT 無狀態，前端刪除 token 即可
    res.json({ success: true, data: { message: '登出成功' } });
  }
}

module.exports = new AuthController();
