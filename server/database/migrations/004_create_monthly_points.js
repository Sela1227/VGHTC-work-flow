module.exports = {
  name: '004_create_monthly_points',

  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS monthly_points (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        year_month VARCHAR(7) NOT NULL,
        initial_points DECIMAL(5,1) NOT NULL DEFAULT 31,
        current_points DECIMAL(5,1) NOT NULL DEFAULT 31,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, year_month)
      );

      CREATE INDEX idx_monthly_points_user ON monthly_points(user_id);
      CREATE INDEX idx_monthly_points_month ON monthly_points(year_month);
    `);
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS monthly_points CASCADE');
  },
};
