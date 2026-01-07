const bcrypt = require('bcryptjs');

module.exports = {
  name: '001_users',

  async run(pool) {
    const users = [
      {
        employee_id: 'Sela',
        name: '系統管理員',
        password: '6812',
        role: 'super_admin',
      },
      {
        employee_id: '00',
        name: '林佳福',
        password: '1111',
        role: 'admin',
      },
      // 同仁 1-12
      ...Array.from({ length: 12 }, (_, i) => ({
        employee_id: String(i + 1),
        name: `同仁 ${i + 1}`,
        password: '0000',
        role: 'staff',
      })),
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query(
        `INSERT INTO users (employee_id, name, password_hash, role, must_change_password)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (employee_id) DO NOTHING`,
        [user.employee_id, user.name, hashedPassword, user.role]
      );
    }

    console.log('✅ 預設使用者建立完成');
  },
};
