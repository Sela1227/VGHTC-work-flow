const caseService = require('../../../services/caseService');

class CaseController {
  // GET /api/v1/cases
  async getCases(req, res, next) {
    try {
      const cases = await caseService.getCases(req.query);
      res.json({ success: true, data: cases });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/cases/my
  async getMyCases(req, res, next) {
    try {
      const cases = await caseService.getCases({ assignedTo: req.user.id });
      res.json({ success: true, data: cases });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/cases/unconfirmed
  async getUnconfirmedCases(req, res, next) {
    try {
      const cases = await caseService.getUnconfirmedCases();
      res.json({ success: true, data: cases });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/cases/:id
  async getCaseById(req, res, next) {
    try {
      const caseData = await caseService.getCaseById(req.params.id);
      res.json({ success: true, data: caseData });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/cases
  async createCase(req, res, next) {
    try {
      const caseData = await caseService.createCase(req.body, req.user.id);
      res.status(201).json({ success: true, data: caseData });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/cases/self-assign
  async selfAssign(req, res, next) {
    try {
      const caseData = await caseService.selfAssign(req.body, req.user.id);
      res.status(201).json({ success: true, data: caseData });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/cases/:id
  async updateCase(req, res, next) {
    try {
      const caseData = await caseService.updateCase(req.params.id, req.body, req.user.id);
      res.json({ success: true, data: caseData });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/cases/:id/assign
  async reassignCase(req, res, next) {
    try {
      const { assignedTo } = req.body;
      const caseData = await caseService.reassignCase(req.params.id, assignedTo, req.user.id);
      res.json({ success: true, data: caseData });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/cases/:id/confirm
  async confirmCase(req, res, next) {
    try {
      const caseData = await caseService.confirmCase(req.params.id, req.user.id);
      res.json({ success: true, data: caseData });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/cases/:id/complete
  async completeCase(req, res, next) {
    try {
      const caseData = await caseService.completeCase(req.params.id, req.user.id);
      res.json({ success: true, data: caseData });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/cases/:id
  async deleteCase(req, res, next) {
    try {
      const result = await caseService.deleteCase(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CaseController();
