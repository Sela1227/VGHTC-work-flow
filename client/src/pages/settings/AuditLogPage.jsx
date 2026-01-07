import { useState, useEffect } from 'react';
import auditService from '../../services/auditService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  History, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  User,
  Settings,
  Calculator
} from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
  });

  useEffect(() => {
    loadLogs(1);
  }, []);

  const loadLogs = async (page) => {
    try {
      setLoading(true);
      const data = await auditService.getLogs({
        page,
        limit: 30,
        action: filters.action || undefined,
        entityType: filters.entityType || undefined,
      });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('載入失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadLogs(1);
  };

  const getActionLabel = (action) => {
    const labels = {
      create: '新增',
      update: '更新',
      delete: '刪除',
      login: '登入',
      logout: '登出',
      assign: '分配',
      complete: '完成',
      confirm: '確認',
      reset: '重置',
    };
    return labels[action] || action;
  };

  const getActionColor = (action) => {
    const colors = {
      create: 'bg-green-100 text-green-700',
      update: 'bg-blue-100 text-blue-700',
      delete: 'bg-red-100 text-red-700',
      login: 'bg-purple-100 text-purple-700',
      logout: 'bg-gray-100 text-gray-700',
      assign: 'bg-orange-100 text-orange-700',
      complete: 'bg-teal-100 text-teal-700',
      confirm: 'bg-indigo-100 text-indigo-700',
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  const getEntityIcon = (entityType) => {
    const icons = {
      case: FileText,
      user: User,
      points: Calculator,
      case_type: Settings,
    };
    const Icon = icons[entityType] || FileText;
    return <Icon size={16} />;
  };

  const getEntityLabel = (entityType) => {
    const labels = {
      case: '案件',
      user: '使用者',
      points: '點數',
      case_type: '案件類型',
      auth: '認證',
    };
    return labels[entityType] || entityType;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">操作日誌</h1>
      </div>

      {/* 篩選器 */}
      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">操作類型</label>
            <select
              className="px-3 py-2 border rounded-lg"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            >
              <option value="">全部</option>
              <option value="create">新增</option>
              <option value="update">更新</option>
              <option value="delete">刪除</option>
              <option value="login">登入</option>
              <option value="assign">分配</option>
              <option value="complete">完成</option>
              <option value="confirm">確認</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">實體類型</label>
            <select
              className="px-3 py-2 border rounded-lg"
              value={filters.entityType}
              onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
            >
              <option value="">全部</option>
              <option value="case">案件</option>
              <option value="user">使用者</option>
              <option value="points">點數</option>
              <option value="case_type">案件類型</option>
            </select>
          </div>
          <Button onClick={handleSearch}>
            <Search size={18} className="mr-2" />
            搜尋
          </Button>
        </div>
      </Card>

      {/* 日誌列表 */}
      <Card>
        {loading ? (
          <div className="text-center py-8">載入中...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <History size={48} className="mx-auto mb-4" />
            <p>沒有操作記錄</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4">時間</th>
                    <th className="text-left py-3 px-4">操作者</th>
                    <th className="text-left py-3 px-4">操作</th>
                    <th className="text-left py-3 px-4">對象</th>
                    <th className="text-left py-3 px-4">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        {log.user_name || '-'}
                        {log.employee_id && (
                          <span className="text-xs text-gray-400 ml-1">
                            ({log.employee_id})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-2">
                          {getEntityIcon(log.entity_type)}
                          {getEntityLabel(log.entity_type)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {log.entity_id || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分頁 */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">
                第 {pagination.page} / {pagination.totalPages} 頁，共 {pagination.total} 筆
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => loadLogs(pagination.page - 1)}
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadLogs(pagination.page + 1)}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
