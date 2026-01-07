module.exports = {
  name: '008_create_system_settings',

  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(50) UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS system_settings CASCADE');
  },
};
