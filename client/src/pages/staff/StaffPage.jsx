import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Plus, Edit2, Trash2, Key, UserCheck, UserX } from 'lucide-react';

export default function StaffPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    password: '0000',
    role: 'staff',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('載入失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
      } else {
        await userService.createUser(formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ employeeId: '', name: '', password: '0000', role: 'staff' });
      loadUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      employeeId: user.employee_id,
      name: user.name,
      role: user.role,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('確定停用此帳號？')) return;
    try {
      await userService.deleteUser(id);
      loadUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleResetPassword = async (id) => {
    if (!confirm('確定重設密碼為 0000？')) return;
    try {
      await userService.resetPassword(id);
      alert('密碼已重設為 0000');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await userService.updateUser(user.id, { isActive: !user.is_active });
      loadUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const roleLabels = {
    admin: '管理者',
    staff: '同仁',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">同仁管理</h1>
        <Button onClick={() => {
          setEditingUser(null);
          setFormData({ employeeId: '', name: '', password: '0000', role: 'staff' });
          setShowModal(true);
        }}>
          <Plus size={20} className="mr-2" />
          新增同仁
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8">載入中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">員工編號</th>
                  <th className="text-left py-3 px-4">姓名</th>
                  <th className="text-left py-3 px-4">角色</th>
                  <th className="text-left py-3 px-4">狀態</th>
                  <th className="text-left py-3 px-4">最後登入</th>
                  <th className="text-left py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={`border-b hover:bg-gray-50 ${!u.is_active ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-4 font-medium">{u.employee_id}</td>
                    <td className="py-3 px-4">{u.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {roleLabels[u.role]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        u.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {u.is_active ? '啟用' : '停用'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleString('zh-TW') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="text-blue-600 hover:text-blue-800"
                          title="編輯"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleResetPassword(u.id)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="重設密碼"
                        >
                          <Key size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={u.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                          title={u.is_active ? '停用' : '啟用'}
                        >
                          {u.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
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
              {editingUser ? '編輯同仁' : '新增同仁'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="員工編號"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                disabled={!!editingUser}
                required
              />
              <Input
                label="姓名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              {!editingUser && (
                <Input
                  label="初始密碼"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="預設 0000"
                />
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="staff">同仁</option>
                  <option value="admin">管理者</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                  取消
                </Button>
                <Button type="submit" className="flex-1">
                  {editingUser ? '更新' : '新增'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
