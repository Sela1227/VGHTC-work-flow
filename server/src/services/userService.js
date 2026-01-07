const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

class UserService {
  // 取得所有使用者（依角色過濾）
  async getUsers(role = null) {
    let query = `
      SELECT id, employee_id, name, role, is_active, must_change_password, 
             created_at, last_login_at
      FROM users
      WHERE role != 'super_admin'
    `;
    const params = [];

    if (role) {
      query += ' AND role = $1';
      params.push(role);
    }

    query += ' ORDER BY employee_id';
    const result = await pool.query(query, params);
    return result.rows;
  }

  // 取得單一使用者
  async getUserById(id) {
    const result = await pool.query(
      `SELECT id, employee_id, name, role, is_active, must_change_password,
              created_at, last_login_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw { statusCode: 404, message: '使用者不存在' };
    }

    return result.rows[0];
  }

  // 新增使用者
  async createUser(data, createdBy) {
    const { employeeId, name, password, role } = data;

    // 檢查員工編號是否重複
    const existing = await pool.query(
      'SELECT id FROM users WHERE employee_id = $1',
      [employeeId]
    );

    if (existing.rows.length > 0) {
      throw { statusCode: 400, message: '員工編號已存在' };
    }

    const hashedPassword = await bcrypt.hash(password || '0000', 10);

    const result = await pool.query(
      `INSERT INTO users (employee_id, name, password_hash, role, must_change_password)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, employee_id, name, role, is_active, created_at`,
      [employeeId, name, hashedPassword, role || 'staff']
    );

    return result.rows[0];
  }

  // 更新使用者
  async updateUser(id, data) {
    const { name, role, isActive } = data;

    // 不能修改超級管理者
    const user = await this.getUserById(id);
    if (user.role === 'super_admin') {
      throw { statusCode: 403, message: '無法修改超級管理者' };
    }

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           role = COALESCE($2, role),
           is_active = COALESCE($3, is_active),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, employee_id, name, role, is_active`,
      [name, role, isActive, id]
    );

    return result.rows[0];
  }

  // 刪除使用者（軟刪除：停用）
  async deleteUser(id) {
    const user = await this.getUserById(id);
    if (user.role === 'super_admin') {
      throw { statusCode: 403, message: '無法刪除超級管理者' };
    }

    await pool.query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );

    return { message: '使用者已停用' };
  }

  // 重設密碼
  async resetPassword(id) {
    const user = await this.getUserById(id);
    if (user.role === 'super_admin') {
      throw { statusCode: 403, message: '無法重設超級管理者密碼' };
    }

    const hashedPassword = await bcrypt.hash('0000', 10);

    await pool.query(
      `UPDATE users 
       SET password_hash = $1, must_change_password = true, updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, id]
    );

    return { message: '密碼已重設為 0000' };
  }
}

module.exports = new UserService();
