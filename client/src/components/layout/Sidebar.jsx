import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Calculator,
  BarChart3,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const getMenuItems = () => {
    const items = [
      { to: '/', icon: LayoutDashboard, label: '儀表板', roles: ['super_admin', 'admin', 'staff'] },
    ];

    if (['super_admin', 'admin'].includes(user?.role)) {
      items.push(
        { to: '/cases', icon: FileText, label: '案件管理', roles: ['admin'], disabled: true },
        { to: '/points', icon: Calculator, label: '點數管理', roles: ['admin'], disabled: true },
        { to: '/staff', icon: Users, label: '同仁管理', roles: ['admin'], disabled: true },
        { to: '/reports', icon: BarChart3, label: '報表中心', roles: ['admin'], disabled: true },
      );
    }

    if (user?.role === 'super_admin') {
      items.push(
        { to: '/admin-manage', icon: Users, label: '管理者管理', disabled: true },
        { to: '/settings', icon: Settings, label: '系統設定', disabled: true },
      );
    }

    return items.filter((item) => item.roles?.includes(user?.role) || !item.roles);
  };

  const menuItems = getMenuItems();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-200 ${
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
              to={item.disabled ? '#' : item.to}
              onClick={(e) => {
                if (item.disabled) e.preventDefault();
                else onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : isActive
                    ? 'bg-sela-orange text-white'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-sela-orange'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.disabled && (
                <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
                  即將推出
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
