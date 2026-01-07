module.exports = {
  name: '005_create_points_adjustments',

  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS points_adjustments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        year_month VARCHAR(7) NOT NULL,
        adjustment_type VARCHAR(20) NOT NULL,
        points DECIMAL(4,1) NOT NULL,
        reason TEXT,
        redistribute BOOLEAN DEFAULT true,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_adjustment_type CHECK (adjustment_type IN ('deduct', 'add'))
      );

      CREATE INDEX idx_points_adj_user ON points_adjustments(user_id);
      CREATE INDEX idx_points_adj_month ON points_adjustments(year_month);
    `);
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS points_adjustments CASCADE');
  },
};
