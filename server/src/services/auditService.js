const { pool } = require('../config/database');

class AuditService {
  // 記錄操作
  async log({ userId, action, entityType, entityId, oldValue, newValue, req }) {
    try {
      const ipAddress = req?.ip || req?.connection?.remoteAddress || null;
      const userAgent = req?.headers?.['user-agent'] || null;

      await pool.query(`
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        userId,
        action,
        entityType,
        entityId,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        ipAddress,
        userAgent
      ]);
    } catch (error) {
      // 日誌記錄失敗不應該影響主要操作
      console.error('Audit log failed:', error);
    }
  }

  // 查詢日誌
  async getLogs({ page = 1, limit = 50, userId, action, entityType, startDate, endDate }) {
    const offset = (page - 1) * limit;
    let whereClause = [];
    let params = [];
    let paramIndex = 1;

    if (userId) {
      whereClause.push(`al.user_id = $${paramIndex++}`);
      params.push(userId);
    }
    if (action) {
      whereClause.push(`al.action = $${paramIndex++}`);
      params.push(action);
    }
    if (entityType) {
      whereClause.push(`al.entity_type = $${paramIndex++}`);
      params.push(entityType);
    }
    if (startDate) {
      whereClause.push(`al.created_at >= $${paramIndex++}`);
      params.push(startDate);
    }
    if (endDate) {
      whereClause.push(`al.created_at <= $${paramIndex++}`);
      params.push(endDate);
    }

    const where = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

    // 取得總數
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM audit_logs al ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // 取得資料
    const result = await pool.query(`
      SELECT 
        al.*,
        u.name as user_name,
        u.employee_id
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${where}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `, [...params, limit, offset]);

    return {
      logs: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // 取得特定實體的歷史記錄
  async getEntityHistory(entityType, entityId) {
    const result = await pool.query(`
      SELECT 
        al.*,
        u.name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.entity_type = $1 AND al.entity_id = $2
      ORDER BY al.created_at DESC
    `, [entityType, entityId]);

    return result.rows;
  }

  // 取得操作類型統計
  async getStats(days = 30) {
    const result = await pool.query(`
      SELECT 
        action,
        entity_type,
        COUNT(*) as count
      FROM audit_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY action, entity_type
      ORDER BY count DESC
    `);

    return result.rows;
  }
}

module.exports = new AuditService();
