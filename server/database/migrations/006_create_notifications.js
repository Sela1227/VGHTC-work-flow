module.exports = {
  name: '006_create_notifications',

  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(100) NOT NULL,
        message TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_notifications_user ON notifications(user_id);
      CREATE INDEX idx_notifications_read ON notifications(is_read);
    `);
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS notifications CASCADE');
  },
};
