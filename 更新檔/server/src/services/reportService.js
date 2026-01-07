const { pool } = require('../config/database');

class ReportService {
  // 取得儀表板統計
  async getDashboardStats() {
    const yearMonth = new Date().toISOString().slice(0, 7);

    // 本月案件統計
    const casesStats = await pool.query(`
      SELECT 
        COUNT(*) as total_cases,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_cases,
        SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as pending_cases,
        SUM(CASE WHEN is_self_assigned = true AND confirmed_at IS NULL THEN 1 ELSE 0 END) as unconfirmed_cases
      FROM cases
      WHERE TO_CHAR(assigned_date, 'YYYY-MM') = $1
    `, [yearMonth]);

    // 活躍同仁數
    const staffCount = await pool.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE role = 'staff' AND is_active = true
    `);

    // 案件類型分布
    const caseTypeDistribution = await pool.query(`
      SELECT ct.code, ct.name, COUNT(c.id) as count
      FROM case_types ct
      LEFT JOIN cases c ON ct.id = c.case_type_id 
        AND TO_CHAR(c.assigned_date, 'YYYY-MM') = $1
      WHERE ct.is_active = true
      GROUP BY ct.id, ct.code, ct.name
      ORDER BY ct.code
    `, [yearMonth]);

    // 點數使用狀況
    const pointsStats = await pool.query(`
      SELECT 
        AVG(current_points) as avg_points,
        MIN(current_points) as min_points,
        MAX(current_points) as max_points
      FROM monthly_points
      WHERE year_month = $1
    `, [yearMonth]);

    return {
      yearMonth,
      cases: casesStats.rows[0],
      staffCount: parseInt(staffCount.rows[0].count),
      caseTypeDistribution: caseTypeDistribution.rows,
      pointsStats: pointsStats.rows[0],
    };
  }

  // 取得月報表
  async getMonthlyReport(yearMonth) {
    const ym = yearMonth || new Date().toISOString().slice(0, 7);

    // 每位同仁的工作量
    const staffWorkload = await pool.query(`
      SELECT 
        u.id as user_id,
        u.employee_id,
        u.name,
        COUNT(c.id) as total_cases,
        SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) as completed_cases,
        SUM(c.points_deducted) as total_points_used,
        mp.initial_points,
        mp.current_points
      FROM users u
      LEFT JOIN cases c ON u.id = c.assigned_to 
        AND TO_CHAR(c.assigned_date, 'YYYY-MM') = $1
      LEFT JOIN monthly_points mp ON u.id = mp.user_id AND mp.year_month = $1
      WHERE u.role = 'staff' AND u.is_active = true
      GROUP BY u.id, u.employee_id, u.name, mp.initial_points, mp.current_points
      ORDER BY u.employee_id
    `, [ym]);

    // 案件類型統計
    const caseTypeStats = await pool.query(`
      SELECT 
        ct.code,
        ct.name,
        ct.weight,
        COUNT(c.id) as total_cases,
        SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) as completed_cases,
        SUM(c.points_deducted) as total_points
      FROM case_types ct
      LEFT JOIN cases c ON ct.id = c.case_type_id 
        AND TO_CHAR(c.assigned_date, 'YYYY-MM') = $1
      WHERE ct.is_active = true
      GROUP BY ct.id, ct.code, ct.name, ct.weight
      ORDER BY ct.code
    `, [ym]);

    // 自主接案統計
    const selfAssignStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN confirmed_at IS NOT NULL THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN confirmed_at IS NULL THEN 1 ELSE 0 END) as pending
      FROM cases
      WHERE is_self_assigned = true 
        AND TO_CHAR(assigned_date, 'YYYY-MM') = $1
    `, [ym]);

    // 總計
    const totals = await pool.query(`
      SELECT 
        COUNT(*) as total_cases,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_cases,
        SUM(points_deducted) as total_points
      FROM cases
      WHERE TO_CHAR(assigned_date, 'YYYY-MM') = $1
    `, [ym]);

    return {
      yearMonth: ym,
      staffWorkload: staffWorkload.rows,
      caseTypeStats: caseTypeStats.rows,
      selfAssignStats: selfAssignStats.rows[0],
      totals: totals.rows[0],
    };
  }

  // 取得個人統計
  async getPersonalStats(userId, months = 6) {
    // 最近幾個月的工作量趨勢
    const monthlyTrend = await pool.query(`
      SELECT 
        TO_CHAR(c.assigned_date, 'YYYY-MM') as year_month,
        COUNT(*) as total_cases,
        SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) as completed_cases,
        SUM(c.points_deducted) as total_points
      FROM cases c
      WHERE c.assigned_to = $1
        AND c.assigned_date >= CURRENT_DATE - INTERVAL '${months} months'
      GROUP BY TO_CHAR(c.assigned_date, 'YYYY-MM')
      ORDER BY year_month DESC
    `, [userId]);

    // 案件類型分布
    const caseTypeBreakdown = await pool.query(`
      SELECT 
        ct.code,
        ct.name,
        COUNT(c.id) as count,
        SUM(c.points_deducted) as points
      FROM cases c
      JOIN case_types ct ON c.case_type_id = ct.id
      WHERE c.assigned_to = $1
        AND c.assigned_date >= CURRENT_DATE - INTERVAL '${months} months'
      GROUP BY ct.id, ct.code, ct.name
      ORDER BY count DESC
    `, [userId]);

    // 自主接案統計
    const selfAssignStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN confirmed_at IS NOT NULL THEN 1 ELSE 0 END) as confirmed
      FROM cases
      WHERE assigned_to = $1 
        AND is_self_assigned = true
        AND assigned_date >= CURRENT_DATE - INTERVAL '${months} months'
    `, [userId]);

    // 點數歷史
    const pointsHistory = await pool.query(`
      SELECT year_month, initial_points, current_points
      FROM monthly_points
      WHERE user_id = $1
      ORDER BY year_month DESC
      LIMIT $2
    `, [userId, months]);

    return {
      userId,
      monthlyTrend: monthlyTrend.rows,
      caseTypeBreakdown: caseTypeBreakdown.rows,
      selfAssignStats: selfAssignStats.rows[0],
      pointsHistory: pointsHistory.rows,
    };
  }

  // 取得可用月份列表
  async getAvailableMonths() {
    const result = await pool.query(`
      SELECT DISTINCT TO_CHAR(assigned_date, 'YYYY-MM') as year_month
      FROM cases
      ORDER BY year_month DESC
      LIMIT 24
    `);
    return result.rows.map(r => r.year_month);
  }

  // 匯出月報表資料（供 Excel 使用）
  async getExportData(yearMonth) {
    const ym = yearMonth || new Date().toISOString().slice(0, 7);

    // 詳細案件列表
    const cases = await pool.query(`
      SELECT 
        c.medical_record_no as "病歷號",
        ct.code as "類型代碼",
        ct.name as "類型名稱",
        u.employee_id as "處理者編號",
        u.name as "處理者",
        c.points_deducted as "點數",
        CASE WHEN c.status = 'completed' THEN '已完成' ELSE '進行中' END as "狀態",
        CASE WHEN c.is_self_assigned THEN '是' ELSE '否' END as "自主接案",
        CASE WHEN c.confirmed_at IS NOT NULL THEN '已確認' 
             WHEN c.is_self_assigned THEN '待確認' 
             ELSE '-' END as "確認狀態",
        TO_CHAR(c.assigned_date, 'YYYY-MM-DD') as "分配日期",
        TO_CHAR(c.completed_date, 'YYYY-MM-DD') as "完成日期",
        c.note as "備註"
      FROM cases c
      LEFT JOIN case_types ct ON c.case_type_id = ct.id
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE TO_CHAR(c.assigned_date, 'YYYY-MM') = $1
      ORDER BY c.assigned_date, c.medical_record_no
    `, [ym]);

    // 同仁工作量彙總
    const staffSummary = await pool.query(`
      SELECT 
        u.employee_id as "員工編號",
        u.name as "姓名",
        COUNT(c.id) as "總案件數",
        SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) as "已完成",
        SUM(c.points_deducted) as "使用點數",
        mp.initial_points as "初始點數",
        mp.current_points as "剩餘點數"
      FROM users u
      LEFT JOIN cases c ON u.id = c.assigned_to 
        AND TO_CHAR(c.assigned_date, 'YYYY-MM') = $1
      LEFT JOIN monthly_points mp ON u.id = mp.user_id AND mp.year_month = $1
      WHERE u.role = 'staff' AND u.is_active = true
      GROUP BY u.id, u.employee_id, u.name, mp.initial_points, mp.current_points
      ORDER BY u.employee_id
    `, [ym]);

    return {
      yearMonth: ym,
      cases: cases.rows,
      staffSummary: staffSummary.rows,
    };
  }
}

module.exports = new ReportService();
