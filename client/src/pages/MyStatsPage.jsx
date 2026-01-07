import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import reportService from '../services/reportService';
import pointsService from '../services/pointsService';
import Card from '../components/common/Card';
import { 
  TrendingUp, 
  Calendar, 
  Award, 
  Target,
  BarChart3,
  Clock
} from 'lucide-react';

export default function MyStatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, pointsData] = await Promise.all([
        reportService.getPersonalStats(),
        pointsService.getCurrentPoints(),
      ]);
      setStats(statsData);
      setCurrentPoints(pointsData);
    } catch (error) {
      console.error('載入失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (ym) => {
    if (!ym) return '';
    const [year, month] = ym.split('-');
    return `${year}/${month}`;
  };

  // 計算總計
  const totals = stats?.monthlyTrend?.reduce((acc, m) => ({
    cases: acc.cases + parseInt(m.total_cases || 0),
    completed: acc.completed + parseInt(m.completed_cases || 0),
    points: acc.points + parseFloat(m.total_points || 0),
  }), { cases: 0, completed: 0, points: 0 }) || { cases: 0, completed: 0, points: 0 };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">我的統計</h1>
      </div>

      {loading ? (
        <div className="text-center py-12">載入中...</div>
      ) : (
        <>
          {/* 當月概覽 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center gap-3">
                <Target size={24} />
                <div>
                  <p className="text-orange-100 text-sm">當月剩餘點數</p>
                  <p className="text-3xl font-bold">
                    {parseFloat(currentPoints?.current_points || 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BarChart3 className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">近6月總案件</p>
                <p className="text-2xl font-bold text-gray-800">{totals.cases}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Award className="text-green-500" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">已完成</p>
                <p className="text-2xl font-bold text-gray-800">{totals.completed}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="text-purple-500" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">自主接案</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats?.selfAssignStats?.total || 0}
                </p>
              </div>
            </Card>
          </div>

          {/* 月度趨勢 */}
          <Card>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-sela-orange" size={20} />
              月度工作量趨勢
            </h2>
            
            {stats?.monthlyTrend?.length > 0 ? (
              <>
                {/* 簡易長條圖 */}
                <div className="flex items-end gap-2 h-40 mb-4">
                  {stats.monthlyTrend.slice().reverse().map((m) => {
                    const maxCases = Math.max(...stats.monthlyTrend.map(t => parseInt(t.total_cases || 0)));
                    const height = maxCases > 0 ? (parseInt(m.total_cases || 0) / maxCases * 100) : 0;
                    return (
                      <div key={m.year_month} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-sela-orange rounded-t-lg transition-all hover:bg-orange-600"
                          style={{ height: `${Math.max(height, 5)}%` }}
                          title={`${m.total_cases} 件`}
                        />
                        <span className="text-xs text-gray-500 mt-2">{formatMonth(m.year_month)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* 數據表格 */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-4">月份</th>
                        <th className="text-right py-2 px-4">案件數</th>
                        <th className="text-right py-2 px-4">已完成</th>
                        <th className="text-right py-2 px-4">使用點數</th>
                        <th className="text-center py-2 px-4">完成率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.monthlyTrend.map((m) => {
                        const rate = m.total_cases > 0 
                          ? (m.completed_cases / m.total_cases * 100) 
                          : 0;
                        return (
                          <tr key={m.year_month} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4 font-medium">{formatMonth(m.year_month)}</td>
                            <td className="py-2 px-4 text-right">{m.total_cases}</td>
                            <td className="py-2 px-4 text-right">{m.completed_cases}</td>
                            <td className="py-2 px-4 text-right">{parseFloat(m.total_points || 0).toFixed(1)}</td>
                            <td className="py-2 px-4">
                              <div className="flex items-center justify-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                                <span className="ml-2 text-sm">{rate.toFixed(0)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">暫無資料</div>
            )}
          </Card>

          {/* 案件類型分布 */}
          <Card>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="text-sela-orange" size={20} />
              案件類型分布（近6月）
            </h2>
            
            {stats?.caseTypeBreakdown?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.caseTypeBreakdown.map((ct) => (
                  <div key={ct.code} className="text-center p-4 bg-gray-50 rounded-lg">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded font-bold mb-2">
                      {ct.code}
                    </span>
                    <p className="text-sm text-gray-500">{ct.name}</p>
                    <p className="text-2xl font-bold text-gray-800">{ct.count}</p>
                    <p className="text-xs text-gray-400">{parseFloat(ct.points || 0).toFixed(1)} 點</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">暫無資料</div>
            )}
          </Card>

          {/* 點數歷史 */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">點數歷史</h2>
            {stats?.pointsHistory?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2 px-4">月份</th>
                      <th className="text-right py-2 px-4">初始點數</th>
                      <th className="text-right py-2 px-4">剩餘點數</th>
                      <th className="text-right py-2 px-4">使用點數</th>
                      <th className="text-center py-2 px-4">使用率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.pointsHistory.map((p) => {
                      const used = (p.initial_points || 0) - (p.current_points || 0);
                      const rate = p.initial_points > 0 ? (used / p.initial_points * 100) : 0;
                      return (
                        <tr key={p.year_month} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium">{formatMonth(p.year_month)}</td>
                          <td className="py-2 px-4 text-right">{parseFloat(p.initial_points || 0).toFixed(1)}</td>
                          <td className="py-2 px-4 text-right font-medium">{parseFloat(p.current_points || 0).toFixed(1)}</td>
                          <td className="py-2 px-4 text-right">{used.toFixed(1)}</td>
                          <td className="py-2 px-4">
                            <div className="flex items-center justify-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-sela-orange h-2 rounded-full"
                                  style={{ width: `${Math.min(rate, 100)}%` }}
                                />
                              </div>
                              <span className="ml-2 text-sm">{rate.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">暫無資料</div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
