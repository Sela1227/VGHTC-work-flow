const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserService {
  // 取得所有使用者（排除超級管理者）
  async getAllUsers() {
    const result = await pool.query(`
      SELECT id, employee_id, name, role, is_active, created_at, updated_at
      FROM users
      WHERE role != 'super_admin'
      ORDER BY 
        CASE role WHEN 'admin' THEN 1 ELSE 2 END,
        employee_id
    `);
    return result.rows;
  }

  // 取得單一使用者
  async getUserById(id) {
    const result = await pool.query(
      'SELECT id, employee_id, name, role, is_active FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // 建立使用者
  async createUser({ employeeId, name, role }) {
    // 檢查員編是否已存在
    const exists = await pool.query(
      'SELECT id FROM users WHERE employee_id = $1',
      [employeeId]
    );
    if (exists.rows.length > 0) {
      throw new Error('員工編號已存在');
    }

    // 預設密碼 0000
    const hashedPassword = await bcrypt.hash('0000', 10);

    const result = await pool.query(`
      INSERT INTO users (employee_id, name, password_hash, role, must_change_password)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id, employee_id, name, role, is_active
    `, [employeeId, name, hashedPassword, role || 'staff']);

    return result.rows[0];
  }

  // 更新使用者（包含員編）
  async updateUser(id, { employeeId, name, role }) {
    // 檢查是否為超級管理者
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('使用者不存在');
    }
    if (user.role === 'super_admin') {
      throw new Error('無法修改超級管理者');
    }

    // 如果要更新員編，檢查是否已被其他人使用
    if (employeeId && employeeId !== user.employee_id) {
      const exists = await pool.query(
        'SELECT id FROM users WHERE employee_id = $1 AND id != $2',
        [employeeId, id]
      );
      if (exists.rows.length > 0) {
        throw new Error('員工編號已被使用');
      }
    }

    const result = await pool.query(`
      UPDATE users 
      SET employee_id = COALESCE($1, employee_id),
          name = COALESCE($2, name), 
          role = COALESCE($3, role),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, employee_id, name, role, is_active
    `, [employeeId, name, role, id]);

    return result.rows[0];
  }

  // 重設密碼為 0000
  async resetPassword(id) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('使用者不存在');
    }
    if (user.role === 'super_admin') {
      throw new Error('無法重設超級管理者密碼');
    }

    const hashedPassword = await bcrypt.hash('0000', 10);
    await pool.query(`
      UPDATE users 
      SET password_hash = $1, must_change_password = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [hashedPassword, id]);

    return { message: '密碼已重設為 0000' };
  }

  // 停用/啟用使用者
  async toggleUserStatus(id) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('使用者不存在');
    }
    if (user.role === 'super_admin') {
      throw new Error('無法停用超級管理者');
    }

    const result = await pool.query(`
      UPDATE users 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, employee_id, name, role, is_active
    `, [id]);

    return result.rows[0];
  }
}

module.exports = new UserService();
