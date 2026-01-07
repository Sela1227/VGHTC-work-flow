require('dotenv').config();

module.exports = {
  app: {
    name: '臺中榮總放射腫瘤科劑量室工作分配系統',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
  },
  db: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '10m',
  },
  system: {
    defaultMonthlyPoints: 31,
    sessionTimeoutMinutes: 10,
    selfAssignConfirmDays: 7,
  },
};
