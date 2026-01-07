const { pool } = require('../config/database');

class CaseService {
  // 取得案件列表
  async getCases(filters = {}) {
    const { status, assignedTo, yearMonth, caseTypeId } = filters;
    let query = `
      SELECT c.*, 
             ct.code as case_type_code, ct.name as case_type_name, ct.weight,
             u1.name as assigned_to_name,
             u2.name as assigned_by_name,
             u3.name as created_by_name
      FROM cases c
      LEFT JOIN case_types ct ON c.case_type_id = ct.id
      LEFT JOIN users u1 ON c.assigned_to = u1.id
      LEFT JOIN users u2 ON c.assigned_by = u2.id
      LEFT JOIN users u3 ON c.created_by = u3.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND c.status = $${paramIndex++}`;
      params.push(status);
    }

    if (assignedTo) {
      query += ` AND c.assigned_to = $${paramIndex++}`;
      params.push(assignedTo);
    }

    if (yearMonth) {
      query += ` AND TO_CHAR(c.assigned_date, 'YYYY-MM') = $${paramIndex++}`;
      params.push(yearMonth);
    }

    if (caseTypeId) {
      query += ` AND c.case_type_id = $${paramIndex++}`;
      params.push(caseTypeId);
    }

    query += ' ORDER BY c.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // 取得單一案件
  async getCaseById(id) {
    const result = await pool.query(
      `SELECT c.*, 
              ct.code as case_type_code, ct.name as case_type_name, ct.weight,
              u1.name as assigned_to_name,
              u2.name as assigned_by_name
       FROM cases c
       LEFT JOIN case_types ct ON c.case_type_id = ct.id
       LEFT JOIN users u1 ON c.assigned_to = u1.id
       LEFT JOIN users u2 ON c.assigned_by = u2.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw { statusCode: 404, message: '案件不存在' };
    }

    return result.rows[0];
  }

  // 新增案件
  async createCase(data, createdBy) {
    const { medicalRecordNo, caseTypeId, assignedTo, note } = data;

    // 取得案件類型權重
    const caseType = await pool.query(
      'SELECT weight FROM case_types WHERE id = $1',
      [caseTypeId]
    );

    if (caseType.rows.length === 0) {
      throw { statusCode: 400, message: '無效的案件類型' };
    }

    const weight = caseType.rows[0].weight;

    const result = await pool.query(
      `INSERT INTO cases (medical_record_no, case_type_id, assigned_to, assigned_by, 
                          points_deducted, status, assigned_date, note, created_by)
       VALUES ($1, $2, $3, $4, $5, 'assigned', CURRENT_DATE, $6, $4)
       RETURNING *`,
      [medicalRecordNo, caseTypeId, assignedTo, createdBy, weight, note]
    );

    // 扣除點數
    if (assignedTo) {
      await this.deductPoints(assignedTo, weight);
    }

    return this.getCaseById(result.rows[0].id);
  }

  // 自主接案
  async selfAssign(data, userId) {
    const { medicalRecordNo, caseTypeId, note } = data;

    const caseType = await pool.query(
      'SELECT weight FROM case_types WHERE id = $1',
      [caseTypeId]
    );

    if (caseType.rows.length === 0) {
      throw { statusCode: 400, message: '無效的案件類型' };
    }

    const weight = caseType.rows[0].weight;

    const result = await pool.query(
      `INSERT INTO cases (medical_record_no, case_type_id, assigned_to, 
                          points_deducted, status, assigned_date, note, 
                          is_self_assigned, created_by)
       VALUES ($1, $2, $3, $4, 'assigned', CURRENT_DATE, $5, true, $3)
       RETURNING *`,
      [medicalRecordNo, caseTypeId, userId, weight, note]
    );

    // 扣除點數
    await this.deductPoints(userId, weight);

    return this.getCaseById(result.rows[0].id);
  }

  // 確認自主接案
  async confirmCase(id, confirmedBy) {
    const caseData = await this.getCaseById(id);

    if (!caseData.is_self_assigned) {
      throw { statusCode: 400, message: '此案件非自主接案' };
    }

    if (caseData.confirmed_at) {
      throw { statusCode: 400, message: '此案件已確認' };
    }

    await pool.query(
      `UPDATE cases 
       SET confirmed_by = $1, confirmed_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [confirmedBy, id]
    );

    return this.getCaseById(id);
  }

  // 完成案件
  async completeCase(id, userId) {
    const caseData = await this.getCaseById(id);

    if (caseData.status === 'completed') {
      throw { statusCode: 400, message: '案件已完成' };
    }

    await pool.query(
      `UPDATE cases 
       SET status = 'completed', completed_date = CURRENT_DATE, updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    return this.getCaseById(id);
  }

  // 重新分配案件
  async reassignCase(id, newAssignedTo, assignedBy) {
    const caseData = await this.getCaseById(id);

    if (caseData.status === 'completed') {
      throw { statusCode: 400, message: '已完成的案件無法重新分配' };
    }

    const oldAssignedTo = caseData.assigned_to;
    const points = parseFloat(caseData.points_deducted);

    // 歸還原處理者點數
    if (oldAssignedTo) {
      await this.addPoints(oldAssignedTo, points);
    }

    // 扣除新處理者點數
    await this.deductPoints(newAssignedTo, points);

    await pool.query(
      `UPDATE cases 
       SET assigned_to = $1, assigned_by = $2, assigned_date = CURRENT_DATE,
           is_self_assigned = false, confirmed_by = NULL, confirmed_at = NULL,
           updated_at = NOW()
       WHERE id = $3`,
      [newAssignedTo, assignedBy, id]
    );

    return this.getCaseById(id);
  }

  // 更新案件
  async updateCase(id, data, userId) {
    const caseData = await this.getCaseById(id);
    const { medicalRecordNo, caseTypeId, note } = data;

    // 檢查權限：只有自己建立的或管理者可修改
    // 這邊先簡單處理，controller 會檢查權限

    await pool.query(
      `UPDATE cases 
       SET medical_record_no = COALESCE($1, medical_record_no),
           case_type_id = COALESCE($2, case_type_id),
           note = COALESCE($3, note),
           updated_at = NOW()
       WHERE id = $4`,
      [medicalRecordNo, caseTypeId, note, id]
    );

    return this.getCaseById(id);
  }

  // 刪除案件
  async deleteCase(id) {
    const caseData = await this.getCaseById(id);

    // 歸還點數
    if (caseData.assigned_to && caseData.status !== 'completed') {
      await this.addPoints(caseData.assigned_to, parseFloat(caseData.points_deducted));
    }

    await pool.query('DELETE FROM cases WHERE id = $1', [id]);

    return { message: '案件已刪除' };
  }

  // 取得待確認的自主接案
  async getUnconfirmedCases() {
    const result = await pool.query(
      `SELECT c.*, 
              ct.code as case_type_code, ct.name as case_type_name,
              u.name as assigned_to_name,
              CURRENT_DATE - c.assigned_date as days_pending
       FROM cases c
       LEFT JOIN case_types ct ON c.case_type_id = ct.id
       LEFT JOIN users u ON c.assigned_to = u.id
       WHERE c.is_self_assigned = true AND c.confirmed_at IS NULL
       ORDER BY c.assigned_date`
    );
    return result.rows;
  }

  // 扣除點數
  async deductPoints(userId, points) {
    const yearMonth = new Date().toISOString().slice(0, 7);

    // 確保有當月點數記錄
    await pool.query(
      `INSERT INTO monthly_points (user_id, year_month, initial_points, current_points)
       VALUES ($1, $2, 31, 31)
       ON CONFLICT (user_id, year_month) DO NOTHING`,
      [userId, yearMonth]
    );

    // 扣除點數
    await pool.query(
      `UPDATE monthly_points 
       SET current_points = current_points - $1, updated_at = NOW()
       WHERE user_id = $2 AND year_month = $3`,
      [points, userId, yearMonth]
    );
  }

  // 增加點數
  async addPoints(userId, points) {
    const yearMonth = new Date().toISOString().slice(0, 7);

    await pool.query(
      `UPDATE monthly_points 
       SET current_points = current_points + $1, updated_at = NOW()
       WHERE user_id = $2 AND year_month = $3`,
      [points, userId, yearMonth]
    );
  }
}

module.exports = new CaseService();
