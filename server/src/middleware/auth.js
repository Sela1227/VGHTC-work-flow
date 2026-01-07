const jwt = require('jsonwebtoken');
const config = require('../config');
const { pool } = require('../config/database');

// 驗證 JWT Token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { message: '未提供認證 Token' },
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    // 從資料庫取得使用者
    const result = await pool.query(
      'SELECT id, employee_id, name, role, is_active, must_change_password FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: '使用者不存在' },
      });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: { message: '帳號已停用' },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Token 已過期，請重新登入' },
      });
    }
    return res.status(401).json({
      success: false,
      error: { message: '無效的 Token' },
    });
  }
};

// 檢查角色權限
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: '權限不足' },
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
