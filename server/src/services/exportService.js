const { pool } = require('../config/database');

class ExportService {
  // 匯出月報表資料（格式化為 Excel 友善格式）
  async getMonthlyExportData(yearMonth) {
    const ym = yearMonth || new Date().toISOString().slice(0, 7);

    // 案件明細
    const cases = await pool.query(`
      SELECT 
        c.id,
        c.medical_record_no,
        ct.code as case_type_code,
        ct.name as case_type_name,
        u.employee_id,
        u.name as assigned_to_name,
        c.points_deducted,
        c.status,
        c.is_self_assigned,
        c.confirmed_at,
        c.assigned_date,
        c.completed_date,
        c.note,
        assigner.name as assigned_by_name
      FROM cases c
      LEFT JOIN case_types ct ON c.case_type_id = ct.id
      LEFT JOIN users u ON c.assigned_to = u.id
      LEFT JOIN users assigner ON c.assigned_by = assigner.id
      WHERE TO_CHAR(c.assigned_date, 'YYYY-MM') = $1
      ORDER BY c.assigned_date, c.id
    `, [ym]);

    // 同仁工作量彙總
    const staffSummary = await pool.query(`
      SELECT 
        u.employee_id,
        u.name,
        COUNT(c.id) as total_cases,
        SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) as completed_cases,
        SUM(c.points_deducted) as total_points_used,
        mp.initial_points,
        mp.current_points,
        SUM(CASE WHEN c.is_self_assigned THEN 1 ELSE 0 END) as self_assigned_cases
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

    return {
      yearMonth: ym,
      cases: cases.rows,
      staffSummary: staffSummary.rows,
      caseTypeStats: caseTypeStats.rows,
      exportedAt: new Date().toISOString()
    };
  }

  // 取得匯入範本結構
  getImportTemplate() {
    return {
      columns: [
        { key: 'medical_record_no', name: '病歷號', required: true, example: '12345678' },
        { key: 'case_type_code', name: '案件類型代碼', required: true, example: 'A' },
        { key: 'employee_id', name: '處理者員工編號', required: false, example: 'E001' },
        { key: 'note', name: '備註', required: false, example: '急件' },
      ],
      example: [
        { medical_record_no: '12345678', case_type_code: 'A', employee_id: 'E001', note: '' },
        { medical_record_no: '87654321', case_type_code: 'B', employee_id: '', note: '急件' },
      ]
    };
  }
}

module.exports = new ExportService();
