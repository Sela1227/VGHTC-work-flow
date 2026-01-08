const userService = require('../../../services/userService');

class UserController {
  // GET /api/v1/users
  async getUsers(req, res, next) {
    try {
      const { role } = req.query;
      const users = await userService.getUsers(role);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/users/:id
  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/users
  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body, req.user.id);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/users/:id
  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/users/:id/toggle - 停用/啟用
  async toggleStatus(req, res, next) {
    try {
      const result = await userService.toggleStatus(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/users/:id - 真正刪除
  async deleteUser(req, res, next) {
    try {
      const result = await userService.deleteUser(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/users/:id/reset-password
  async resetPassword(req, res, next) {
    try {
      const result = await userService.resetPassword(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
