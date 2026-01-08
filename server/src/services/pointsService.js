const { pool } = require('../config/database');

class PointsService {
  // 取得使用者當月點數
  async getCurrentPoints(userId) {
    const yearMonth = new Date().toISOString().slice(0, 7);

    await pool.query(
      `INSERT INTO monthly_points (user_id, year_month, initial_points, current_points)
       VALUES ($1, $2, 31, 31)
       ON CONFLICT (user_id, year_month) DO NOTHING`,
      [userId, yearMonth]
    );

    const result = await pool.query(
      `SELECT mp.*, u.name as user_name, u.employee_id
       FROM monthly_points mp
       JOIN users u ON mp.user_id = u.id
       WHERE mp.user_id = $1 AND mp.year_month = $2`,
      [userId, yearMonth]
    );

    return result.rows[0];
  }

  // 取得所有人當月點數
  async getAllCurrentPoints() {
    const yearMonth = new Date().toISOString().slice(0, 7);

    await pool.query(
      `INSERT INTO monthly_points (user_id, year_month, initial_points, current_points)
       SELECT id, $1, 31, 31 FROM users 
       WHERE is_active = true AND role != 'super_admin'
       ON CONFLICT (user_id, year_month) DO NOTHING`,
      [yearMonth]
    );

    const result = await pool.query(
      `SELECT mp.*, u.name as user_name, u.employee_id
       FROM monthly_points mp
       JOIN users u ON mp.user_id = u.id
       WHERE mp.year_month = $1 AND u.role != 'super_admin'
       ORDER BY u.employee_id`,
      [yearMonth]
    );

    return result.rows;
  }

  // 取得點數歷史
  async getPointsHistory(userId, months = 6) {
    const result = await pool.query(
      `SELECT mp.*, u.name as user_name
       FROM monthly_points mp
       JOIN users u ON mp.user_id = u.id
       WHERE mp.user_id = $1
       ORDER BY mp.year_month DESC
       LIMIT $2`,
      [userId, months]
    );

    return result.rows;
  }

  // 點數調整
  async adjustPoints(data, createdBy) {
    const { userId, points, adjustmentType, reason, redistribute } = data;
    const yearMonth = new Date().toISOString().slice(0, 7);

    await this.getCurrentPoints(userId);

    await pool.query(
      `INSERT INTO points_adjustments 
       (user_id, year_month, adjustment_type, points, reason, redistribute, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, yearMonth, adjustmentType, points, reason, redistribute, createdBy]
    );

    if (adjustmentType === 'deduct') {
      await pool.query(
        `UPDATE monthly_points 
         SET current_points = current_points - $1, updated_at = NOW()
         WHERE user_id = $2 AND year_month = $3`,
        [points, userId, yearMonth]
      );

      if (redistribute) {
        await this.redistributePoints(userId, points, yearMonth);
      }
    } else {
      await pool.query(
        `UPDATE monthly_points 
         SET current_points = current_points + $1, updated_at = NOW()
         WHERE user_id = $2 AND year_month = $3`,
        [points, userId, yearMonth]
      );
    }

    return this.getCurrentPoints(userId);
  }

  // 重新分配點數給其他人
  async redistributePoints(excludeUserId, totalPoints, yearMonth) {
    const othersResult = await pool.query(
      `SELECT COUNT(*) as count FROM users 
       WHERE id != $1 AND is_active = true AND role = 'staff'`,
      [excludeUserId]
    );

    const othersCount = parseInt(othersResult.rows[0].count);
    if (othersCount === 0) return;

    const pointsPerPerson = totalPoints / othersCount;

    await pool.query(
      `UPDATE monthly_points mp
       SET current_points = current_points + $1, updated_at = NOW()
       FROM users u
       WHERE mp.user_id = u.id 
         AND mp.year_month = $2 
         AND u.id != $3 
         AND u.is_active = true 
         AND u.role = 'staff'`,
      [pointsPerPerson, yearMonth, excludeUserId]
    );
  }

  // 取得調整記錄
  async getAdjustments(yearMonth = null) {
    let query = `
      SELECT pa.*, u.name as user_name, u.employee_id, u2.name as created_by_name
      FROM points_adjustments pa
      JOIN users u ON pa.user_id = u.id
      JOIN users u2 ON pa.created_by = u2.id
    `;
    const params = [];

    if (yearMonth) {
      query += ' WHERE pa.year_month = $1';
      params.push(yearMonth);
    }

    query += ' ORDER BY pa.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // 刪除調整記錄（並還原點數）
  async deleteAdjustment(id) {
    // 取得調整記錄
    const adjResult = await pool.query(
      'SELECT * FROM points_adjustments WHERE id = $1',
      [id]
    );

    if (adjResult.rows.length === 0) {
      throw new Error('調整記錄不存在');
    }

    const adj = adjResult.rows[0];

    // 還原點數
    if (adj.adjustment_type === 'deduct') {
      // 原本是扣除，現在加回來
      await pool.query(
        `UPDATE monthly_points 
         SET current_points = current_points + $1, updated_at = NOW()
         WHERE user_id = $2 AND year_month = $3`,
        [adj.points, adj.user_id, adj.year_month]
      );

      // 如果當初有重分配，從其他人扣回來
      if (adj.redistribute) {
        await this.reverseRedistribute(adj.user_id, adj.points, adj.year_month);
      }
    } else {
      // 原本是增加，現在扣除
      await pool.query(
        `UPDATE monthly_points 
         SET current_points = current_points - $1, updated_at = NOW()
         WHERE user_id = $2 AND year_month = $3`,
        [adj.points, adj.user_id, adj.year_month]
      );
    }

    // 刪除記錄
    await pool.query('DELETE FROM points_adjustments WHERE id = $1', [id]);

    return { message: '調整記錄已刪除，點數已還原' };
  }

  // 還原重分配的點數
  async reverseRedistribute(excludeUserId, totalPoints, yearMonth) {
    const othersResult = await pool.query(
      `SELECT COUNT(*) as count FROM users 
       WHERE id != $1 AND is_active = true AND role = 'staff'`,
      [excludeUserId]
    );

    const othersCount = parseInt(othersResult.rows[0].count);
    if (othersCount === 0) return;

    const pointsPerPerson = totalPoints / othersCount;

    await pool.query(
      `UPDATE monthly_points mp
       SET current_points = current_points - $1, updated_at = NOW()
       FROM users u
       WHERE mp.user_id = u.id 
         AND mp.year_month = $2 
         AND u.id != $3 
         AND u.is_active = true 
         AND u.role = 'staff'`,
      [pointsPerPerson, yearMonth, excludeUserId]
    );
  }

  // 月初重置點數
  async monthlyReset() {
    const yearMonth = new Date().toISOString().slice(0, 7);

    const result = await pool.query(
      `INSERT INTO monthly_points (user_id, year_month, initial_points, current_points)
       SELECT id, $1, 31, 31 FROM users 
       WHERE is_active = true AND role != 'super_admin'
       ON CONFLICT (user_id, year_month) DO NOTHING
       RETURNING *`,
      [yearMonth]
    );

    return {
      message: `已為 ${result.rowCount} 位使用者初始化 ${yearMonth} 點數`,
      yearMonth,
      count: result.rowCount
    };
  }
}

module.exports = new PointsService();
