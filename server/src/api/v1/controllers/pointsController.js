const pointsService = require('../../../services/pointsService');

class PointsController {
  // GET /api/v1/points/current
  async getCurrentPoints(req, res, next) {
    try {
      const points = await pointsService.getCurrentPoints(req.user.id);
      res.json({ success: true, data: points });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/points/all
  async getAllCurrentPoints(req, res, next) {
    try {
      const points = await pointsService.getAllCurrentPoints();
      res.json({ success: true, data: points });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/points/history/:userId
  async getPointsHistory(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const { months } = req.query;
      const history = await pointsService.getPointsHistory(userId, months ? parseInt(months) : 6);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/points/adjust
  async adjustPoints(req, res, next) {
    try {
      const result = await pointsService.adjustPoints(req.body, req.user.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/points/adjustments
  async getAdjustments(req, res, next) {
    try {
      const { yearMonth } = req.query;
      const adjustments = await pointsService.getAdjustments(yearMonth);
      res.json({ success: true, data: adjustments });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/points/monthly-reset
  async monthlyReset(req, res, next) {
    try {
      const result = await pointsService.monthlyReset();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PointsController();
