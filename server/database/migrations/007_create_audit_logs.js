module.exports = {
  name: '007_create_audit_logs',

  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        target_type VARCHAR(50),
        target_id INTEGER,
        details JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
      CREATE INDEX idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
    `);
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS audit_logs CASCADE');
  },
};
