import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import pointsService from '../services/pointsService';
import caseService from '../services/caseService';
import Card from '../components/common/Card';
import {
  Calculator,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    currentPoints: 31,
    totalCases: 0,
    completedCases: 0,
    pendingCases: 0,
    unconfirmedCases: [],
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  const roleLabels = {
    super_admin: '超級管理者',
    admin: '管理者',
    staff: '同仁',
  };

  const currentMonth = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // 取得當月點數
      const pointsData = await pointsService.getCurrentPoints();
      
      // 取得案件統計
      const casesData = isAdmin 
        ? await caseService.getCases() 
        : await caseService.getMyCases();
      
      const completedCases = casesData.filter(c => c.status === 'completed').length;
      const pendingCases = casesData.filter(c => c.status === 'assigned').length;

      // 管理者取得待確認案件
      let unconfirmedCases = [];
      if (isAdmin) {
        unconfirmedCases = await caseService.getUnconfirmedCases();
      }

      setStats({
        currentPoints: parseFloat(pointsData.current_points || 31),
        totalCases: casesData.length,
        completedCases,
        pendingCases,
        unconfirmedCases,
      });
    } catch (error) {
      console.error('載入失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 歡迎區塊 */}
      <div className="bg-gradient-to-r from-sela-orange to-orange-400 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          歡迎回來，{user?.name}！
        </h1>
        <p className="text-orange-100">
          {roleLabels[user?.role]} · {currentMonth}
        </p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-xl">
            <Calculator className="text-sela-orange" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">剩餘點數</p>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '-' : stats.currentPoints.toFixed(1)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FileText className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">本月案件</p>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '-' : stats.totalCases}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <CheckCircle className="text-green-500" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">已完成</p>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '-' : stats.completedCases}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-xl">
            <Clock className="text-yellow-500" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">進行中</p>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '-' : stats.pendingCases}
            </p>
          </div>
        </Card>
      </div>

      {/* 快速連結 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/cases">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sela-orange/10 rounded-xl">
                  <FileText className="text-sela-orange" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {isAdmin ? '案件管理' : '我的案件'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isAdmin ? '檢視與分配案件' : '檢視與自主接案'}
                  </p>
                </div>
              </div>
              <ArrowRight className="text-gray-400" size={20} />
            </div>
          </Card>
        </Link>

        {isAdmin && (
          <Link to="/points">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Calculator className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">點數管理</h3>
                    <p className="text-sm text-gray-500">檢視與調整點數</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400" size={20} />
              </div>
            </Card>
          </Link>
        )}
      </div>

      {/* 管理者提醒 */}
      {isAdmin && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="text-sela-orange" size={20} />
            管理提醒
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-gray-700">待確認的自主接案</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                stats.unconfirmedCases.length > 0 
                  ? 'bg-sela-orange text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {stats.unconfirmedCases.length} 件
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">超過 5 天未確認</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                stats.unconfirmedCases.filter(c => c.days_pending > 5).length > 0 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {stats.unconfirmedCases.filter(c => c.days_pending > 5).length} 件
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* 系統資訊 */}
      <Card className="bg-gray-50">
        <p className="text-sm text-gray-500 text-center">
          臺中榮總放射腫瘤科劑量室工作分配系統 v1.0.0
        </p>
      </Card>
    </div>
  );
}
