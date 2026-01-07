import { useState, useEffect } from 'react';
import caseService from '../../services/caseService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  AlertCircle, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertTriangle,
  RefreshCw 
} from 'lucide-react';

export default function UnconfirmedPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await caseService.getUnconfirmedCases();
      setCases(data);
      setSelectedIds([]);
    } catch (error) {
      console.error('載入失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await caseService.confirmCase(id);
      loadCases();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBatchConfirm = async () => {
    if (selectedIds.length === 0) {
      alert('請先選擇案件');
      return;
    }
    if (!confirm(`確定要確認 ${selectedIds.length} 筆案件？`)) return;

    setConfirming(true);
    try {
      for (const id of selectedIds) {
        await caseService.confirmCase(id);
      }
      loadCases();
    } catch (error) {
      alert('部分案件確認失敗: ' + error.message);
      loadCases();
    } finally {
      setConfirming(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === cases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cases.map(c => c.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getDaysColor = (days) => {
    if (days >= 7) return 'bg-red-100 text-red-600';
    if (days >= 5) return 'bg-orange-100 text-orange-600';
    if (days >= 3) return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  const overdueCases = cases.filter(c => c.days_pending >= 7);
  const warningCases = cases.filter(c => c.days_pending >= 5 && c.days_pending < 7);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">待確認案件</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={loadCases}>
            <RefreshCw size={18} className="mr-2" />
            重新整理
          </Button>
          {selectedIds.length > 0 && (
            <Button onClick={handleBatchConfirm} disabled={confirming}>
              <CheckCheck size={18} className="mr-2" />
              批次確認 ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* 警示統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Clock className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">待確認總數</p>
            <p className="text-2xl font-bold text-gray-800">{cases.length}</p>
          </div>
        </Card>

        <Card className={`flex items-center gap-4 ${warningCases.length > 0 ? 'border-orange-300 bg-orange-50' : ''}`}>
          <div className="p-3 bg-orange-100 rounded-xl">
            <AlertCircle className="text-orange-500" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">即將逾期（5-6天）</p>
            <p className="text-2xl font-bold text-orange-600">{warningCases.length}</p>
          </div>
        </Card>

        <Card className={`flex items-center gap-4 ${overdueCases.length > 0 ? 'border-red-300 bg-red-50' : ''}`}>
          <div className="p-3 bg-red-100 rounded-xl">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">已逾期（≥7天）</p>
            <p className="text-2xl font-bold text-red-600">{overdueCases.length}</p>
          </div>
        </Card>
      </div>

      {/* 案件列表 */}
      <Card>
        {loading ? (
          <div className="text-center py-8">載入中...</div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12">
            <Check size={48} className="mx-auto text-green-500 mb-4" />
            <p className="text-gray-500">目前沒有待確認的案件</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === cases.length && cases.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left py-3 px-4">病歷號</th>
                  <th className="text-left py-3 px-4">類型</th>
                  <th className="text-left py-3 px-4">申請者</th>
                  <th className="text-left py-3 px-4">點數</th>
                  <th className="text-left py-3 px-4">申請日期</th>
                  <th className="text-center py-3 px-4">等待天數</th>
                  <th className="text-left py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr 
                    key={c.id} 
                    className={`border-b hover:bg-gray-50 ${
                      c.days_pending >= 7 ? 'bg-red-50' : 
                      c.days_pending >= 5 ? 'bg-orange-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">{c.medical_record_no}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-sm">
                        {c.case_type_code}
                      </span>
                    </td>
                    <td className="py-3 px-4">{c.assigned_to_name}</td>
                    <td className="py-3 px-4">{c.points_deducted}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {c.assigned_date?.slice(0, 10)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDaysColor(c.days_pending)}`}>
                        {c.days_pending} 天
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleConfirm(c.id)}
                      >
                        <Check size={16} className="mr-1" />
                        確認
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 說明 */}
      <Card className="bg-gray-50">
        <h3 className="font-semibold mb-2">說明</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 自主接案需由管理者確認後才正式生效</li>
          <li>• <span className="text-yellow-600">黃色</span>：等待 3-4 天</li>
          <li>• <span className="text-orange-600">橘色</span>：等待 5-6 天（即將逾期）</li>
          <li>• <span className="text-red-600">紅色</span>：等待 7 天以上（已逾期）</li>
          <li>• 可使用批次確認功能一次確認多筆案件</li>
        </ul>
      </Card>
    </div>
  );
}
