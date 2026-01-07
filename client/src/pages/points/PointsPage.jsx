import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import pointsService from '../../services/pointsService';
import userService from '../../services/userService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Calculator, Plus, Minus, Users } from 'lucide-react';

export default function PointsPage() {
  const { user } = useAuth();
  const [allPoints, setAllPoints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    userId: '',
    points: '',
    adjustmentType: 'deduct',
    reason: '',
    redistribute: true,
  });

  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pointsData, staffData, adjData] = await Promise.all([
        pointsService.getAllCurrentPoints(),
        userService.getUsers('staff'),
        pointsService.getAdjustments(),
      ]);
      setAllPoints(pointsData);
      setStaff(staffData);
      setAdjustments(adjData);
    } catch (error) {
      console.error('載入失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await pointsService.adjustPoints({
        ...formData,
        points: parseFloat(formData.points),
      });
      setShowModal(false);
      setFormData({
        userId: '',
        points: '',
        adjustmentType: 'deduct',
        reason: '',
        redistribute: true,
      });
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const currentMonth = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">點數管理</h1>
        {isAdmin && (
          <Button onClick={() => setShowModal(true)}>
            <Calculator size={20} className="mr-2" />
            點數調整
          </Button>
        )}
      </div>

      {/* 總覽 */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="text-sela-orange" size={20} />
          {currentMonth} 點數總覽
        </h2>
        
        {loading ? (
          <div className="text-center py-8">載入中...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allPoints.map((p) => (
              <div
                key={p.user_id}
                className={`p-4 rounded-lg border ${
                  parseFloat(p.current_points) <= 5
                    ? 'border-red-200 bg-red-50'
                    : parseFloat(p.current_points) <= 15
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="text-sm text-gray-500">{p.employee_id}</div>
                <div className="font-semibold">{p.user_name}</div>
                <div className="text-2xl font-bold text-sela-orange mt-2">
                  {parseFloat(p.current_points).toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">
                  初始: {parseFloat(p.initial_points).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 調整記錄 */}
      {isAdmin && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">調整記錄</h2>
          {adjustments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">無調整記錄</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">同仁</th>
                    <th className="text-left py-3 px-4">類型</th>
                    <th className="text-left py-3 px-4">點數</th>
                    <th className="text-left py-3 px-4">原因</th>
                    <th className="text-left py-3 px-4">重分配</th>
                    <th className="text-left py-3 px-4">操作者</th>
                    <th className="text-left py-3 px-4">時間</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustments.slice(0, 20).map((a) => (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{a.user_name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          a.adjustment_type === 'deduct'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {a.adjustment_type === 'deduct' ? '扣除' : '增加'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{a.points}</td>
                      <td className="py-3 px-4">{a.reason}</td>
                      <td className="py-3 px-4">{a.redistribute ? '是' : '否'}</td>
                      <td className="py-3 px-4">{a.created_by_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(a.created_at).toLocaleString('zh-TW')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* 調整 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">點數調整</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">同仁</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  required
                >
                  <option value="">請選擇</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.employee_id} - {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">調整類型</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="deduct"
                      checked={formData.adjustmentType === 'deduct'}
                      onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value })}
                      className="mr-2"
                    />
                    <Minus size={16} className="mr-1 text-red-500" /> 扣除
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="add"
                      checked={formData.adjustmentType === 'add'}
                      onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value })}
                      className="mr-2"
                    />
                    <Plus size={16} className="mr-1 text-green-500" /> 增加
                  </label>
                </div>
              </div>
              <Input
                label="點數"
                type="number"
                step="0.5"
                min="0.5"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                required
              />
              <Input
                label="原因"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="例：長假、其他任務"
                required
              />
              {formData.adjustmentType === 'deduct' && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.redistribute}
                    onChange={(e) => setFormData({ ...formData, redistribute: e.target.checked })}
                    className="mr-2"
                  />
                  重新分配給其他同仁
                </label>
              )}
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                  取消
                </Button>
                <Button type="submit" className="flex-1">
                  確定
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
