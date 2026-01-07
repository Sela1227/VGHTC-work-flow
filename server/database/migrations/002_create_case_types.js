module.exports = {
  name: '002_create_case_types',

  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS case_types (
        id SERIAL PRIMARY KEY,
        code VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(50) NOT NULL,
        weight DECIMAL(3,1) NOT NULL DEFAULT 1.0,
        monthly_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_case_types_code ON case_types(code);
    `);
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS case_types CASCADE');
  },
};
