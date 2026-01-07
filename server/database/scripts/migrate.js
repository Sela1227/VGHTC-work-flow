require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  console.log('🚀 開始執行資料庫遷移...\n');

  try {
    // 建立 migrations 追蹤表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 取得已執行的 migrations
    const executed = await pool.query('SELECT name FROM _migrations');
    const executedNames = executed.rows.map((r) => r.name);

    // 讀取 migration 檔案
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    let count = 0;
    for (const file of files) {
      if (!file.endsWith('.js')) continue;

      const migration = require(path.join(migrationsDir, file));
      if (executedNames.includes(migration.name)) {
        console.log(`⏭️  跳過: ${migration.name}`);
        continue;
      }

      console.log(`📦 執行: ${migration.name}`);
      await migration.up(pool);
      await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [migration.name]);
      count++;
    }

    if (count === 0) {
      console.log('\n✅ 沒有新的 migration 需要執行');
    } else {
      console.log(`\n✅ 成功執行 ${count} 個 migration`);
    }
  } catch (error) {
    console.error('❌ Migration 失敗:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
