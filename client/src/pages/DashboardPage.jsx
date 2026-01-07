import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import {
  Calculator,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const roleLabels = {
    super_admin: '超級管理者',
    admin: '管理者',
    staff: '同仁',
  };

  const currentMonth = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
  });

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
            <p className="text-2xl font-bold text-gray-800">31.0</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FileText className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">本月案件</p>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <CheckCircle className="text-green-500" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">已完成</p>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-xl">
            <Clock className="text-yellow-500" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">進行中</p>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
        </Card>
      </div>

      {/* 待處理事項 */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="text-sela-orange" size={20} />
          待處理事項
        </h2>
        <div className="text-center py-8 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-50" />
          <p>目前沒有待處理的案件</p>
        </div>
      </Card>

      {/* 管理者提醒 */}
      {['super_admin', 'admin'].includes(user?.role) && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="text-sela-orange" size={20} />
            管理提醒
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-gray-700">待確認的自主接案</span>
              <span className="bg-sela-orange text-white px-3 py-1 rounded-full text-sm">
                0 件
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">超過 5 天未確認</span>
              <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-sm">
                0 件
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
        <p className="text-xs text-gray-400 text-center mt-1">
          Phase 2 將開放案件管理、點數系統等功能
        </p>
      </Card>
    </div>
  );
}
