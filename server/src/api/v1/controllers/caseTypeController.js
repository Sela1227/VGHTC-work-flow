const caseTypeService = require('../../../services/caseTypeService');

class CaseTypeController {
  // GET /api/v1/case-types
  async getCaseTypes(req, res, next) {
    try {
      const { includeInactive } = req.query;
      const caseTypes = await caseTypeService.getCaseTypes(includeInactive === 'true');
      res.json({ success: true, data: caseTypes });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/case-types/stats
  async getCaseTypeStats(req, res, next) {
    try {
      const { yearMonth } = req.query;
      const stats = await caseTypeService.getCaseTypeStats(yearMonth);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/case-types/:id
  async getCaseTypeById(req, res, next) {
    try {
      const caseType = await caseTypeService.getCaseTypeById(req.params.id);
      res.json({ success: true, data: caseType });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/case-types
  async createCaseType(req, res, next) {
    try {
      const caseType = await caseTypeService.createCaseType(req.body);
      res.status(201).json({ success: true, data: caseType });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/case-types/:id
  async updateCaseType(req, res, next) {
    try {
      const caseType = await caseTypeService.updateCaseType(req.params.id, req.body);
      res.json({ success: true, data: caseType });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/case-types/:id
  async deleteCaseType(req, res, next) {
    try {
      const result = await caseTypeService.deleteCaseType(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CaseTypeController();
