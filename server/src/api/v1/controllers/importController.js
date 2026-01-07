const importService = require('../../../services/importService');
const exportService = require('../../../services/exportService');

class ImportController {
  // GET /api/v1/import/template
  async getTemplate(req, res, next) {
    try {
      const template = exportService.getImportTemplate();
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/import/preview
  async previewImport(req, res, next) {
    try {
      const { rows } = req.body;
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ success: false, message: '請提供匯入資料' });
      }
      const result = await importService.previewImport(rows);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/import/execute
  async executeImport(req, res, next) {
    try {
      const { rows } = req.body;
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ success: false, message: '請提供匯入資料' });
      }
      const result = await importService.importCases(rows, req.user.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ImportController();
