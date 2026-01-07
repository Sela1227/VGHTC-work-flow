import { useState, useEffect } from 'react';
import reportService from '../../services/reportService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { FileText, Download, Users, TrendingUp, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonths();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      loadReport(selectedMonth);
    }
  }, [selectedMonth]);

  const loadMonths = async () => {
    try {
      const data = await reportService.getAvailableMonths();
      setMonths(data);
      if (data.length > 0) {
        setSelectedMonth(data[0]);
      } else {
        // 如果沒有資料，使用當前月份
        setSelectedMonth(new Date().toISOString().slice(0, 7));
      }
    } catch (error) {
      console.error('載入月份失敗:', error);
      setSelectedMonth(new Date().toISOString().slice(0, 7));
    }
  };

  const loadReport = async (ym) => {
    try {
      setLoading(true);
      const data = await reportService.getMonthlyReport(ym);
      setReport(data);
    } catch (error) {
      console.error('載入報表失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await reportService.getExportData(selectedMonth);
      
      // 轉換為 CSV
      const casesCSV = convertToCSV(data.cases);
      const staffCSV = convertToCSV(data.staffSummary);
      
      // 下載案件明細
      downloadCSV(casesCSV, `案件明細_${selectedMonth}.csv`);
      
      // 下載同仁彙總
      setTimeout(() => {
        downloadCSV(staffCSV, `同仁工作量_${selectedMonth}.csv`);
      }, 500);
      
    } catch (error) {
      alert('匯出失敗: ' + error.message);
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') 
          ? `"${str.replace(/"/g, '""')}"` 
          : str;
      }).join(',')
    );
    return '\uFEFF' + [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatMonth = (ym) => {
    const [year, month] = ym.split('-');
    return `${year} 年 ${parseInt(month)} 月`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">月報表</h1>
        <div className="flex gap-3">
          <select
            className="px-4 py-2 border rounded-lg"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.length > 0 ? (
              months.map((m) => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))
            ) : (
              <option value={selectedMonth}>{formatMonth(selectedMonth)}</option>
            )}
          </select>
          <Button onClick={handleExport}>
            <Download size={20} className="mr-2" />
            匯出 CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">載入中...</div>
      ) : report ? (
        <>
          {/* 總覽卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <div className="text-sm text-gray-500">總案件數</div>
              <div className="text-3xl font-bold text-sela-orange">
                {report.totals?.total_cases || 0}
              </div>
            </Card>
            <Card className="text-center">
              <div className="text-sm text-gray-500">已完成</div>
              <div className="text-3xl font-bold text-green-600">
                {report.totals?.completed_cases || 0}
              </div>
            </Card>
            <Card className="text-center">
              <div className="text-sm text-gray-500">總使用點數</div>
              <div className="text-3xl font-bold text-blue-600">
                {parseFloat(report.totals?.total_points || 0).toFixed(1)}
              </div>
            </Card>
            <Card className="text-center">
              <div className="text-sm text-gray-500">自主接案</div>
              <div className="text-3xl font-bold text-purple-600">
                {report.selfAssignStats?.total || 0}
              </div>
            </Card>
          </div>

          {/* 同仁工作量 */}
          <Card>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="text-sela-orange" size={20} />
              同仁工作量
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4">員工編號</th>
                    <th className="text-left py-3 px-4">姓名</th>
                    <th className="text-right py-3 px-4">案件數</th>
                    <th className="text-right py-3 px-4">已完成</th>
                    <th className="text-right py-3 px-4">使用點數</th>
                    <th className="text-right py-3 px-4">剩餘點數</th>
                    <th className="text-center py-3 px-4">使用率</th>
                  </tr>
                </thead>
                <tbody>
                  {report.staffWorkload?.map((s) => {
                    const usageRate = s.initial_points > 0
                      ? ((s.initial_points - (s.current_points || 0)) / s.initial_points * 100)
                      : 0;
                    return (
                      <tr key={s.user_id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{s.employee_id}</td>
                        <td className="py-3 px-4 font-medium">{s.name}</td>
                        <td className="py-3 px-4 text-right">{s.total_cases || 0}</td>
                        <td className="py-3 px-4 text-right">{s.completed_cases || 0}</td>
                        <td className="py-3 px-4 text-right">{parseFloat(s.total_points_used || 0).toFixed(1)}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {parseFloat(s.current_points || 0).toFixed(1)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-sela-orange h-2 rounded-full"
                                style={{ width: `${Math.min(usageRate, 100)}%` }}
                              />
                            </div>
                            <span className="ml-2 text-sm">{usageRate.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 案件類型統計 */}
          <Card>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-sela-orange" size={20} />
              案件類型統計
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4">代碼</th>
                    <th className="text-left py-3 px-4">名稱</th>
                    <th className="text-right py-3 px-4">權重</th>
                    <th className="text-right py-3 px-4">案件數</th>
                    <th className="text-right py-3 px-4">已完成</th>
                    <th className="text-right py-3 px-4">總點數</th>
                  </tr>
                </thead>
                <tbody>
                  {report.caseTypeStats?.map((ct) => (
                    <tr key={ct.code} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded font-bold">
                          {ct.code}
                        </span>
                      </td>
                      <td className="py-3 px-4">{ct.name}</td>
                      <td className="py-3 px-4 text-right">{ct.weight}</td>
                      <td className="py-3 px-4 text-right font-medium">{ct.total_cases || 0}</td>
                      <td className="py-3 px-4 text-right">{ct.completed_cases || 0}</td>
                      <td className="py-3 px-4 text-right">{parseFloat(ct.total_points || 0).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <Card className="text-center py-12 text-gray-400">
          沒有報表資料
        </Card>
      )}
    </div>
  );
}
