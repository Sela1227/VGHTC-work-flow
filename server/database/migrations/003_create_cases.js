module.exports = {
  name: '003_create_cases',

  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cases (
        id SERIAL PRIMARY KEY,
        medical_record_no VARCHAR(50) NOT NULL,
        case_type_id INTEGER REFERENCES case_types(id),
        assigned_to INTEGER REFERENCES users(id),
        assigned_by INTEGER REFERENCES users(id),
        points_deducted DECIMAL(4,1) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        assigned_date DATE,
        completed_date DATE,
        note TEXT,
        is_self_assigned BOOLEAN DEFAULT false,
        confirmed_by INTEGER REFERENCES users(id),
        confirmed_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_status CHECK (status IN ('pending', 'assigned', 'completed'))
      );

      CREATE INDEX idx_cases_medical_record ON cases(medical_record_no);
      CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
      CREATE INDEX idx_cases_status ON cases(status);
      CREATE INDEX idx_cases_assigned_date ON cases(assigned_date);
    `);
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS cases CASCADE');
  },
};
