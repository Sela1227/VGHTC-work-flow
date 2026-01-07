import { useState } from 'react';
import pointsService from '../../services/pointsService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  Settings, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';

export default function SystemPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const currentMonth = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
  });

  const handleMonthlyReset = async () => {
    if (!confirm(`確定要執行 ${currentMonth} 的點數初始化？\n\n這會為所有活躍同仁建立當月的點數記錄（31點）。\n已存在的記錄不會被覆蓋。`)) {
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await pointsService.monthlyReset();
      setResult({
        success: true,
        message: data.message,
      });
    } catch (error) {
      setResult({
        success: false,
        message: error.message || '執行失敗',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">系統設定</h1>
      </div>

      {/* 月初點數重置 */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="text-sela-orange" size={20} />
          月初點數重置
        </h2>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-gray-600 mb-2">
            每月初需要執行此功能，為所有活躍同仁初始化當月點數（31點）。
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• 系統會自動檢查，已有當月記錄的同仁不會被重複建立</li>
            <li>• 建議在每月 1 日執行</li>
            <li>• 目前月份：<strong>{currentMonth}</strong></li>
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={handleMonthlyReset} 
            disabled={loading}
            className="min-w-32"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" />
                執行中...
              </>
            ) : (
              <>
                <RefreshCw size={18} className="mr-2" />
                執行重置
              </>
            )}
          </Button>

          {result && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {result.success ? (
                <CheckCircle size={18} />
              ) : (
                <AlertTriangle size={18} />
              )}
              <span>{result.message}</span>
            </div>
          )}
        </div>
      </Card>

      {/* 系統資訊 */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="text-sela-orange" size={20} />
          系統資訊
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">系統版本</p>
            <p className="font-medium">v1.0.0</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">每月基準點數</p>
            <p className="font-medium">31 點</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">自主接案確認期限</p>
            <p className="font-medium">7 天</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">API 版本</p>
            <p className="font-medium">v1</p>
          </div>
        </div>
      </Card>

      {/* 注意事項 */}
      <Card className="border-yellow-200 bg-yellow-50">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-700">
          <AlertTriangle size={20} />
          注意事項
        </h2>
        <ul className="text-sm text-yellow-700 space-y-2">
          <li>• 請定期備份資料庫</li>
          <li>• JWT_SECRET 應使用強密碼並妥善保管</li>
          <li>• 建議每月初檢查並執行點數重置</li>
          <li>• 定期檢查待確認案件，避免逾期</li>
        </ul>
      </Card>
    </div>
  );
}
