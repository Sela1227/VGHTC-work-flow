require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  console.log('🌱 開始填入種子資料...\n');

  try {
    const seedsDir = path.join(__dirname, '../seeds');
    const files = fs.readdirSync(seedsDir).sort();

    for (const file of files) {
      if (!file.endsWith('.js')) continue;

      const seeder = require(path.join(seedsDir, file));
      console.log(`📦 執行: ${seeder.name}`);
      await seeder.run(pool);
    }

    console.log('\n✅ 種子資料填入完成');
  } catch (error) {
    console.error('❌ Seed 失敗:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
