module.exports = {
  name: '001_create_users',

  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(50) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'staff',
        is_active BOOLEAN DEFAULT true,
        must_change_password BOOLEAN DEFAULT true,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_role CHECK (role IN ('super_admin', 'admin', 'staff'))
      );

      CREATE INDEX idx_users_employee_id ON users(employee_id);
      CREATE INDEX idx_users_role ON users(role);
    `);
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
  },
};
