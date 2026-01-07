import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Calculator,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Wrench,
  History,
  Upload,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  const menuItems = [
    { to: '/', icon: LayoutDashboard, label: '儀表板' },
    { to: '/cases', icon: FileText, label: isAdmin ? '案件管理' : '我的案件' },
    { to: '/my-stats', icon: BarChart3, label: '我的統計' },
  ];

  // 管理者選單
  if (isAdmin) {
    menuItems.push(
      { to: '/unconfirmed', icon: AlertCircle, label: '待確認案件', highlight: true },
      { to: '/import', icon: Upload, label: '批次匯入' },
      { to: '/points', icon: Calculator, label: '點數管理' },
      { to: '/reports', icon: TrendingUp, label: '月報表' },
      { to: '/staff', icon: Users, label: '同仁管理' },
      { to: '/case-types', icon: Settings, label: '案件類型' },
      { to: '/audit', icon: History, label: '操作日誌' },
      { to: '/system', icon: Wrench, label: '系統設定' },
    );
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-200 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 md:hidden"
        >
          <X size={20} />
        </button>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sela-orange text-white'
                    : item.highlight
                    ? 'text-orange-600 hover:bg-orange-50 font-medium'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-sela-orange'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* 版本資訊 */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-xs text-gray-400">v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
