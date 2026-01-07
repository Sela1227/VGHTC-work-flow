const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { pool } = require('../config/database');

class AuthService {
  // 登入
  async login(employeeId, password) {
    // 查詢使用者
    const result = await pool.query(
      'SELECT * FROM users WHERE employee_id = $1',
      [employeeId]
    );

    if (result.rows.length === 0) {
      throw { statusCode: 401, message: '帳號或密碼錯誤' };
    }

    const user = result.rows[0];

    // 檢查帳號是否啟用
    if (!user.is_active) {
      throw { statusCode: 401, message: '帳號已停用' };
    }

    // 驗證密碼
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw { statusCode: 401, message: '帳號或密碼錯誤' };
    }

    // 產生 JWT Token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // 更新最後登入時間
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    return {
      token,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        name: user.name,
        role: user.role,
        mustChangePassword: user.must_change_password,
      },
    };
  }

  // 修改密碼
  async changePassword(userId, currentPassword, newPassword) {
    // 取得使用者
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw { statusCode: 404, message: '使用者不存在' };
    }

    const user = result.rows[0];

    // 驗證目前密碼
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw { statusCode: 400, message: '目前密碼錯誤' };
    }

    // 更新密碼
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, must_change_password = false, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );

    return { message: '密碼修改成功' };
  }

  // 取得當前使用者資訊
  async getCurrentUser(userId) {
    const result = await pool.query(
      'SELECT id, employee_id, name, role, is_active, must_change_password, created_at, last_login_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw { statusCode: 404, message: '使用者不存在' };
    }

    const user = result.rows[0];
    return {
      id: user.id,
      employeeId: user.employee_id,
      name: user.name,
      role: user.role,
      isActive: user.is_active,
      mustChangePassword: user.must_change_password,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
    };
  }
}

module.exports = new AuthService();
