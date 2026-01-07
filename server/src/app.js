require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { pool } = require('./config/database');
const routes = require('./api/v1/routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 中介軟體
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由
app.use('/api/v1', routes);

// 健康檢查
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// 靜態檔案 (前端) - 從 client/dist 提供
const clientPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientPath));

// 前端路由 (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// 錯誤處理
app.use(errorHandler);

// 啟動伺服器
const PORT = config.app.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log('==========================================');
  console.log('🏥 臺中榮總放射腫瘤科劑量室工作分配系統');
  console.log('==========================================');
  console.log(`🚀 伺服器運行於 port ${PORT}`);
  console.log(`📝 環境: ${config.app.env}`);
  console.log('==========================================');
});

module.exports = app;
