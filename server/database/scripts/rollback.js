require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function rollback() {
  const rollbackAll = process.argv.includes('--all');
  console.log(rollbackAll ? '🔄 回滾所有 migrations...\n' : '🔄 回滾最後一個 migration...\n');

  try {
    // 取得已執行的 migrations
    const executed = await pool.query(
      'SELECT name FROM _migrations ORDER BY executed_at DESC'
    );

    if (executed.rows.length === 0) {
      console.log('✅ 沒有 migration 可以回滾');
      return;
    }

    const toRollback = rollbackAll ? executed.rows : [executed.rows[0]];

    // 讀取 migration 檔案
    const migrationsDir = path.join(__dirname, '../migrations');

    for (const row of toRollback) {
      const file = fs.readdirSync(migrationsDir).find((f) => {
        const migration = require(path.join(migrationsDir, f));
        return migration.name === row.name;
      });

      if (file) {
        const migration = require(path.join(migrationsDir, file));
        console.log(`🔙 回滾: ${migration.name}`);
        await migration.down(pool);
        await pool.query('DELETE FROM _migrations WHERE name = $1', [migration.name]);
      }
    }

    console.log('\n✅ 回滾完成');
  } catch (error) {
    console.error('❌ 回滾失敗:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

rollback();
