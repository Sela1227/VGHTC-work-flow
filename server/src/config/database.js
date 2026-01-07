const { Pool } = require('pg');
const config = require('./index');

const pool = new Pool({
  connectionString: config.db.url,
  ssl: config.app.env === 'production' ? { rejectUnauthorized: false } : false,
});

// 測試連線
pool.on('connect', () => {
  console.log('📦 資料庫連線成功');
});

pool.on('error', (err) => {
  console.error('❌ 資料庫連線錯誤:', err);
});

module.exports = { pool };
