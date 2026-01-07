const auditService = require('../../../services/auditService');

class AuditController {
  // GET /api/v1/audit/logs
  async getLogs(req, res, next) {
    try {
      const { page, limit, userId, action, entityType, startDate, endDate } = req.query;
      const result = await auditService.getLogs({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        userId: userId ? parseInt(userId) : null,
        action,
        entityType,
        startDate,
        endDate
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/audit/entity/:type/:id
  async getEntityHistory(req, res, next) {
    try {
      const { type, id } = req.params;
      const history = await auditService.getEntityHistory(type, parseInt(id));
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/audit/stats
  async getStats(req, res, next) {
    try {
      const { days } = req.query;
      const stats = await auditService.getStats(parseInt(days) || 30);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditController();
