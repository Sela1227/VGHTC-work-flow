-- 操作日誌表
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,          -- create, update, delete, login, logout, etc.
  entity_type VARCHAR(50) NOT NULL,     -- case, user, points, case_type, etc.
  entity_id INTEGER,                     -- 被操作的實體 ID
  old_value JSONB,                       -- 變更前的值
  new_value JSONB,                       -- 變更後的值
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

COMMENT ON TABLE audit_logs IS '操作日誌';
