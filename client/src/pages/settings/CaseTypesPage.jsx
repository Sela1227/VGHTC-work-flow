import { useState, useEffect } from 'react';
import caseTypeService from '../../services/caseTypeService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function CaseTypesPage() {
  const [caseTypes, setCaseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    weight: '1.0',
    monthlyCount: '0',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await caseTypeService.getCaseTypes(true);
      setCaseTypes(data);
    } catch (error) {
      console.error('載入失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        weight: parseFloat(formData.weight),
        monthlyCount: parseInt(formData.monthlyCount),
      };
      
      if (editingType) {
        await caseTypeService.updateCaseType(editingType.id, data);
      } else {
        await caseTypeService.createCaseType(data);
      }
      setShowModal(false);
      setEditingType(null);
      setFormData({ code: '', name: '', weight: '1.0', monthlyCount: '0' });
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (ct) => {
    setEditingType(ct);
    setFormData({
      code: ct.code,
      name: ct.name,
      weight: ct.weight.toString(),
      monthlyCount: ct.monthly_count.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('確定刪除/停用此案件類型？')) return;
    try {
      await caseTypeService.deleteCaseType(id);
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleToggleActive = async (ct) => {
    try {
      await caseTypeService.updateCaseType(ct.id, { isActive: !ct.is_active });
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  // 計算總負載
  const totalLoad = caseTypes
    .filter(ct => ct.is_active)
    .reduce((sum, ct) => sum + (ct.monthly_count * parseFloat(ct.weight)), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">案件類型管理</h1>
        <Button onClick={() => {
          setEditingType(null);
          setFormData({ code: '', name: '', weight: '1.0', monthlyCount: '0' });
          setShowModal(true);
        }}>
          <Plus size={20} className="mr-2" />
          新增類型
        </Button>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-sm text-gray-500">總類型數</div>
          <div className="text-2xl font-bold text-sela-orange">{caseTypes.filter(ct => ct.is_active).length}</div>
        </Card>
        <Card className="text-center">
          <div className="text-sm text-gray-500">月案件總數</div>
          <div className="text-2xl font-bold text-blue-600">
            {caseTypes.filter(ct => ct.is_active).reduce((sum, ct) => sum + ct.monthly_count, 0)}
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-sm text-gray-500">月總負載</div>
          <div className="text-2xl font-bold text-green-600">{totalLoad.toFixed(1)}</div>
        </Card>
        <Card className="text-center">
          <div className="text-sm text-gray-500">每人基準</div>
          <div className="text-2xl font-bold text-purple-600">31</div>
        </Card>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8">載入中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">代碼</th>
                  <th className="text-left py-3 px-4">名稱</th>
                  <th className="text-left py-3 px-4">權重</th>
                  <th className="text-left py-3 px-4">月件數</th>
                  <th className="text-left py-3 px-4">月負載</th>
                  <th className="text-left py-3 px-4">狀態</th>
                  <th className="text-left py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {caseTypes.map((ct) => (
                  <tr key={ct.id} className={`border-b hover:bg-gray-50 ${!ct.is_active ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded font-bold">
                        {ct.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{ct.name}</td>
                    <td className="py-3 px-4">{ct.weight}</td>
                    <td className="py-3 px-4">{ct.monthly_count}</td>
                    <td className="py-3 px-4 font-medium">
                      {(ct.monthly_count * parseFloat(ct.weight)).toFixed(1)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        ct.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {ct.is_active ? '啟用' : '停用'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(ct)}
                          className="text-blue-600 hover:text-blue-800"
                          title="編輯"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(ct)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title={ct.is_active ? '停用' : '啟用'}
                        >
                          {ct.is_active ? '停用' : '啟用'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingType ? '編輯案件類型' : '新增案件類型'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="代碼"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                disabled={!!editingType}
                placeholder="例：A, B, C"
                required
              />
              <Input
                label="名稱"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例：Eclipse, Tomo"
                required
              />
              <Input
                label="權重"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                required
              />
              <Input
                label="月件數"
                type="number"
                min="0"
                value={formData.monthlyCount}
                onChange={(e) => setFormData({ ...formData, monthlyCount: e.target.value })}
                required
              />
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                  取消
                </Button>
                <Button type="submit" className="flex-1">
                  {editingType ? '更新' : '新增'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
