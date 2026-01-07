const { pool } = require('../config/database');
const caseService = require('./caseService');

class ImportService {
  // 驗證匯入資料
  async validateImportData(rows) {
    const errors = [];
    const validRows = [];

    // 取得所有有效的案件類型
    const caseTypesResult = await pool.query(
      'SELECT id, code FROM case_types WHERE is_active = true'
    );
    const caseTypeMap = {};
    caseTypesResult.rows.forEach(ct => {
      caseTypeMap[ct.code.toUpperCase()] = ct.id;
    });

    // 取得所有有效的同仁
    const staffResult = await pool.query(
      'SELECT id, employee_id FROM users WHERE role = $1 AND is_active = true',
      ['staff']
    );
    const staffMap = {};
    staffResult.rows.forEach(s => {
      staffMap[s.employee_id.toUpperCase()] = s.id;
    });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel 從第 2 行開始（第 1 行是標題）
      const rowErrors = [];

      // 檢查病歷號
      if (!row.medical_record_no || String(row.medical_record_no).trim() === '') {
        rowErrors.push('病歷號為必填');
      }

      // 檢查案件類型
      const caseTypeCode = String(row.case_type_code || '').trim().toUpperCase();
      if (!caseTypeCode) {
        rowErrors.push('案件類型代碼為必填');
      } else if (!caseTypeMap[caseTypeCode]) {
        rowErrors.push(`案件類型 "${caseTypeCode}" 不存在`);
      }

      // 檢查員工編號（如果有填）
      let assignedTo = null;
      const employeeId = String(row.employee_id || '').trim().toUpperCase();
      if (employeeId) {
        if (!staffMap[employeeId]) {
          rowErrors.push(`員工編號 "${employeeId}" 不存在或已停用`);
        } else {
          assignedTo = staffMap[employeeId];
        }
      }

      if (rowErrors.length > 0) {
        errors.push({ row: rowNum, errors: rowErrors });
      } else {
        validRows.push({
          medical_record_no: String(row.medical_record_no).trim(),
          case_type_id: caseTypeMap[caseTypeCode],
          assigned_to: assignedTo,
          note: row.note || null
        });
      }
    }

    return { validRows, errors };
  }

  // 執行批次匯入
  async importCases(rows, assignedBy) {
    const { validRows, errors } = await this.validateImportData(rows);

    if (errors.length > 0) {
      return {
        success: false,
        imported: 0,
        errors
      };
    }

    const results = [];
    let importedCount = 0;

    for (const row of validRows) {
      try {
        const newCase = await caseService.createCase({
          medicalRecordNo: row.medical_record_no,
          caseTypeId: row.case_type_id,
          assignedTo: row.assigned_to,
          note: row.note
        }, assignedBy);

        results.push({ medical_record_no: row.medical_record_no, success: true, id: newCase.id });
        importedCount++;
      } catch (error) {
        results.push({ 
          medical_record_no: row.medical_record_no, 
          success: false, 
          error: error.message 
        });
      }
    }

    return {
      success: true,
      imported: importedCount,
      total: validRows.length,
      results
    };
  }

  // 預覽匯入（只驗證不執行）
  async previewImport(rows) {
    const { validRows, errors } = await this.validateImportData(rows);

    return {
      valid: validRows.length,
      invalid: errors.length,
      errors,
      preview: validRows.slice(0, 10) // 只顯示前 10 筆
    };
  }
}

module.exports = new ImportService();
