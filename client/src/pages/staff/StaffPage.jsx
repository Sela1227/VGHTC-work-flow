import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  Users, 
  Plus, 
  Edit, 
  Key, 
  UserX, 
  UserCheck,
  Trash2,
  X 
} from 'lucide-react';

export default function StaffPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    role: 'staff',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data || []);
    } catch (error) {
      console.error('載入失敗:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        employeeId: user.employee_id,
        name: user.name,
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({ employeeId: '', name: '', role: 'staff' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ employeeId: '', name: '', role: 'staff' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.update(editingUser.id, formData);
      } else {
        await userService.create(formData);
      }
      handleCloseModal();
      loadUsers();
    } catch (error) {
      alert(error.message || '操作失敗');
    }
  };

  const handleResetPassword = async (user) => {
    if (!confirm(`確定要重設 ${user.name} 的密碼為 0000？`)) return;
    try {
      await userService.resetPassword(user.id);
      alert('密碼已重設為 0000');
    } catch (error) {
      alert(error.message || '重設失敗');
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.is_active ? '停用' : '啟用';
    if (!confirm(`確定要${action} ${user.name}？`)) return;
    try {
      await userService.toggleStatus(user.id);
      loadUsers();
    } catch (error) {
      alert(error.message || '操作失敗');
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`確定要永久刪除 ${user.name}？\n\n此操作無法復原！`)) return;
    try {
      await userService.delete(user.id);
      loadUsers();
    } catch (error) {
      alert(error.message || '刪除失敗');
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-blue-100 text-blue-700',
      staff: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      admin: '管理者',
      staff: '同仁',
    };
    return (
      <span className={`px-2 py-1 rounded text-sm ${styles[role] || styles.staff}`}>
        {labels[role] || role}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">同仁管理</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} className="mr-2" />
          新增同仁
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8">載入中...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p>尚無同仁資料</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">員工編號</th>
                  <th className="text-left py-3 px-4">姓名</th>
                  <th className="text-left py-3 px-4">角色</th>
                  <th className="text-left py-3 px-4">狀態</th>
                  <th className="text-left py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={`border-b hover:bg-gray-50 ${!user.is_active ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-4 font-mono">{user.employee_id}</td>
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? '啟用中' : '已停用'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="編輯"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                          title="重設密碼"
                        >
                          <Key size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 rounded ${
                            user.is_active 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.is_active ? '停用' : '啟用'}
                        >
                          {user.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="刪除"
                        >
                          <Trash2 size={18} />
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingUser ? '編輯同仁' : '新增同仁'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  員工編號
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sela-orange focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sela-orange focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sela-orange focus:border-transparent"
                >
                  <option value="staff">同仁</option>
                  <option value="admin">管理者</option>
                </select>
              </div>

              {!editingUser && (
                <p className="text-sm text-gray-500">
                  新使用者的預設密碼為 <strong>0000</strong>，首次登入需修改密碼
                </p>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
                  取消
                </Button>
                <Button type="submit" className="flex-1">
                  {editingUser ? '儲存' : '新增'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
