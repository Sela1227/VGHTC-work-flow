import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Calculator,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  const menuItems = [
    { to: '/', icon: LayoutDashboard, label: '儀表板' },
    { to: '/cases', icon: FileText, label: isAdmin ? '案件管理' : '我的案件' },
  ];

  // 管理者選單
  if (isAdmin) {
    menuItems.push(
      { to: '/points', icon: Calculator, label: '點數管理' },
      { to: '/staff', icon: Users, label: '同仁管理' },
      { to: '/case-types', icon: Settings, label: '案件類型' },
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
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sela-orange text-white'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-sela-orange'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
