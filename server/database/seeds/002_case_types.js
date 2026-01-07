module.exports = {
  name: '002_case_types',

  async run(pool) {
    const caseTypes = [
      { code: 'A', name: 'Eclipse', weight: 1.0, monthly_count: 250 },
      { code: 'B', name: 'Tomo', weight: 1.2, monthly_count: 15 },
      { code: 'C', name: 'RAB', weight: 1.0, monthly_count: 12 },
      { code: 'D', name: 'CK', weight: 2.5, monthly_count: 35 },
    ];

    for (const type of caseTypes) {
      await pool.query(
        `INSERT INTO case_types (code, name, weight, monthly_count)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO NOTHING`,
        [type.code, type.name, type.weight, type.monthly_count]
      );
    }

    console.log('✅ 預設案件類型建立完成');
  },
};
