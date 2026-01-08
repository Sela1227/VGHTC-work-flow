const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserService {
  // 取得使用者列表
  async getUsers(role) {
    let query = `
      SELECT id, employee_id, name, role, is_active, created_at, updated_at
      FROM users
      WHERE role != 'super_admin'
    `;
    const params = [];

    if (role) {
      query += ' AND role = $1';
      params.push(role);
    }

    query += `
      ORDER BY 
        CASE role WHEN 'admin' THEN 1 ELSE 2 END,
        employee_id
    `;

    const result = await pool.query(query, params);
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
  async createUser(data, createdBy) {
    const { employeeId, name, role } = data;
    
    const exists = await pool.query(
      'SELECT id FROM users WHERE employee_id = $1',
      [employeeId]
    );
    if (exists.rows.length > 0) {
      throw new Error('員工編號已存在');
    }

    const hashedPassword = await bcrypt.hash('0000', 10);

    const result = await pool.query(`
      INSERT INTO users (employee_id, name, password_hash, role, must_change_password)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id, employee_id, name, role, is_active
    `, [employeeId, name, hashedPassword, role || 'staff']);

    return result.rows[0];
  }

  // 更新使用者
  async updateUser(id, data) {
    const { employeeId, name, role } = data;
    
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('使用者不存在');
    }
    if (user.role === 'super_admin') {
      throw new Error('無法修改超級管理者');
    }

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

  // 停用/啟用使用者
  async toggleStatus(id) {
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

  // 真正刪除使用者
  async deleteUser(id) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('使用者不存在');
    }
    if (user.role === 'super_admin') {
      throw new Error('無法刪除超級管理者');
    }

    // 檢查是否有關聯的案件
    const cases = await pool.query(
      'SELECT COUNT(*) as count FROM cases WHERE assigned_to = $1',
      [id]
    );

    if (parseInt(cases.rows[0].count) > 0) {
      throw new Error('此同仁有關聯案件，無法刪除。請先刪除或重新分配其案件。');
    }

    // 刪除點數記錄
    await pool.query('DELETE FROM monthly_points WHERE user_id = $1', [id]);
    await pool.query('DELETE FROM points_adjustments WHERE user_id = $1', [id]);
    
    // 刪除使用者
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    return { message: '同仁已刪除' };
  }

  // 重設密碼
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
}

module.exports = new UserService();
