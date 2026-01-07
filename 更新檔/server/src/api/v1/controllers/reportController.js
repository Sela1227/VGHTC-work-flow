const reportService = require('../../../services/reportService');

class ReportController {
  // GET /api/v1/reports/dashboard
  async getDashboardStats(req, res, next) {
    try {
      const stats = await reportService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/reports/monthly
  async getMonthlyReport(req, res, next) {
    try {
      const { yearMonth } = req.query;
      const report = await reportService.getMonthlyReport(yearMonth);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/reports/personal/:userId?
  async getPersonalStats(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const { months } = req.query;
      const stats = await reportService.getPersonalStats(userId, months ? parseInt(months) : 6);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/reports/months
  async getAvailableMonths(req, res, next) {
    try {
      const months = await reportService.getAvailableMonths();
      res.json({ success: true, data: months });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/reports/export
  async getExportData(req, res, next) {
    try {
      const { yearMonth } = req.query;
      const data = await reportService.getExportData(yearMonth);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
