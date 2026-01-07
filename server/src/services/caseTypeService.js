const { pool } = require('../config/database');

class CaseTypeService {
  // 取得所有案件類型
  async getCaseTypes(includeInactive = false) {
    let query = 'SELECT * FROM case_types';
    if (!includeInactive) {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY code';

    const result = await pool.query(query);
    return result.rows;
  }

  // 取得單一案件類型
  async getCaseTypeById(id) {
    const result = await pool.query(
      'SELECT * FROM case_types WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw { statusCode: 404, message: '案件類型不存在' };
    }

    return result.rows[0];
  }

  // 新增案件類型
  async createCaseType(data) {
    const { code, name, weight, monthlyCount } = data;

    // 檢查代碼是否重複
    const existing = await pool.query(
      'SELECT id FROM case_types WHERE code = $1',
      [code]
    );

    if (existing.rows.length > 0) {
      throw { statusCode: 400, message: '案件類型代碼已存在' };
    }

    const result = await pool.query(
      `INSERT INTO case_types (code, name, weight, monthly_count)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [code, name, weight || 1.0, monthlyCount || 0]
    );

    return result.rows[0];
  }

  // 更新案件類型
  async updateCaseType(id, data) {
    const { name, weight, monthlyCount, isActive } = data;

    const result = await pool.query(
      `UPDATE case_types 
       SET name = COALESCE($1, name),
           weight = COALESCE($2, weight),
           monthly_count = COALESCE($3, monthly_count),
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, weight, monthlyCount, isActive, id]
    );

    if (result.rows.length === 0) {
      throw { statusCode: 404, message: '案件類型不存在' };
    }

    return result.rows[0];
  }

  // 刪除案件類型（軟刪除）
  async deleteCaseType(id) {
    // 檢查是否有關聯案件
    const cases = await pool.query(
      'SELECT COUNT(*) as count FROM cases WHERE case_type_id = $1',
      [id]
    );

    if (parseInt(cases.rows[0].count) > 0) {
      // 有關聯案件，只能停用
      await pool.query(
        'UPDATE case_types SET is_active = false, updated_at = NOW() WHERE id = $1',
        [id]
      );
      return { message: '案件類型已停用（有關聯案件無法刪除）' };
    }

    await pool.query('DELETE FROM case_types WHERE id = $1', [id]);
    return { message: '案件類型已刪除' };
  }

  // 取得案件類型統計
  async getCaseTypeStats(yearMonth = null) {
    const ym = yearMonth || new Date().toISOString().slice(0, 7);

    const result = await pool.query(
      `SELECT ct.*, 
              COUNT(c.id) as case_count,
              SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) as completed_count
       FROM case_types ct
       LEFT JOIN cases c ON ct.id = c.case_type_id 
         AND TO_CHAR(c.assigned_date, 'YYYY-MM') = $1
       WHERE ct.is_active = true
       GROUP BY ct.id
       ORDER BY ct.code`,
      [ym]
    );

    return result.rows;
  }
}

module.exports = new CaseTypeService();
