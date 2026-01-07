import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import caseService from '../../services/caseService';
import caseTypeService from '../../services/caseTypeService';
import userService from '../../services/userService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Plus, Search, Filter, Check, X, RefreshCw } from 'lucide-react';

export default function CasesPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ status: '', caseTypeId: '' });
  
  const [formData, setFormData] = useState({
    medicalRecordNo: '',
    caseTypeId: '',
    assignedTo: '',
    note: '',
  });

  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesData, typesData, staffData] = await Promise.all([
        isAdmin ? caseService.getCases(filters) : caseService.getMyCases(),
        caseTypeService.getCaseTypes(),
        isAdmin ? userService.getUsers('staff') : Promise.resolve([]),
      ]);
      setCases(casesData);
      setCaseTypes(typesData);
      setStaff(staffData);
    } catch (error) {
      console.error('載入失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isAdmin) {
        await caseService.createCase(formData);
      } else {
        await caseService.selfAssign(formData);
      }
      setShowModal(false);
      setFormData({ medicalRecordNo: '', caseTypeId: '', assignedTo: '', note: '' });
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleComplete = async (id) => {
    if (!confirm('確定完成此案件？')) return;
    try {
      await caseService.completeCase(id);
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('確定刪除此案件？')) return;
    try {
      await caseService.deleteCase(id);
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await caseService.confirmCase(id);
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const statusLabels = {
    pending: { text: '待分配', color: 'bg-gray-100 text-gray-600' },
    assigned: { text: '進行中', color: 'bg-blue-100 text-blue-600' },
    completed: { text: '已完成', color: 'bg-green-100 text-green-600' },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {isAdmin ? '案件管理' : '我的案件'}
        </h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} className="mr-2" />
          {isAdmin ? '新增案件' : '自主接案'}
        </Button>
      </div>

      {/* 篩選器 */}
      {isAdmin && (
        <Card className="flex flex-wrap gap-4">
          <select
            className="px-4 py-2 border rounded-lg"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">全部狀態</option>
            <option value="assigned">進行中</option>
            <option value="completed">已完成</option>
          </select>
          <select
            className="px-4 py-2 border rounded-lg"
            value={filters.caseTypeId}
            onChange={(e) => setFilters({ ...filters, caseTypeId: e.target.value })}
          >
            <option value="">全部類型</option>
            {caseTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.code} - {t.name}</option>
            ))}
          </select>
          <Button variant="secondary" onClick={loadData}>
            <RefreshCw size={16} className="mr-2" /> 重新整理
          </Button>
        </Card>
      )}

      {/* 案件列表 */}
      <Card>
        {loading ? (
          <div className="text-center py-8">載入中...</div>
        ) : cases.length === 0 ? (
          <div className="text-center py-8 text-gray-400">沒有案件</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">病歷號</th>
                  <th className="text-left py-3 px-4">類型</th>
                  <th className="text-left py-3 px-4">處理者</th>
                  <th className="text-left py-3 px-4">點數</th>
                  <th className="text-left py-3 px-4">狀態</th>
                  <th className="text-left py-3 px-4">日期</th>
                  <th className="text-left py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{c.medical_record_no}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-sm">
                        {c.case_type_code}
                      </span>
                    </td>
                    <td className="py-3 px-4">{c.assigned_to_name || '-'}</td>
                    <td className="py-3 px-4">{c.points_deducted}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${statusLabels[c.status]?.color}`}>
                        {statusLabels[c.status]?.text}
                        {c.is_self_assigned && !c.confirmed_at && ' (待確認)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {c.assigned_date?.slice(0, 10)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {c.status !== 'completed' && (
                          <button
                            onClick={() => handleComplete(c.id)}
                            className="text-green-600 hover:text-green-800"
                            title="完成"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        {isAdmin && c.is_self_assigned && !c.confirmed_at && (
                          <button
                            onClick={() => handleConfirm(c.id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="確認"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        {(isAdmin || c.created_by === user?.id) && c.status !== 'completed' && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-red-600 hover:text-red-800"
                            title="刪除"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 新增/自主接案 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {isAdmin ? '新增案件' : '自主接案'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="病歷號"
                value={formData.medicalRecordNo}
                onChange={(e) => setFormData({ ...formData, medicalRecordNo: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">案件類型</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.caseTypeId}
                  onChange={(e) => setFormData({ ...formData, caseTypeId: e.target.value })}
                  required
                >
                  <option value="">請選擇</option>
                  {caseTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code} - {t.name} ({t.weight} 點)
                    </option>
                  ))}
                </select>
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">指派給</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    required
                  >
                    <option value="">請選擇</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>{s.employee_id} - {s.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <Input
                label="備註"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
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
