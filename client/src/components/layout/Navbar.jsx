import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  const roleLabels = {
    super_admin: '超級管理者',
    admin: '管理者',
    staff: '同仁',
  };

  return (
    <nav className="bg-sela-orange text-white shadow-lg sticky top-0 z-50">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-white/10 md:hidden"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SELA" className="h-10 w-10" />
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg leading-tight">劑量室工作分配系統</h1>
              <p className="text-xs text-orange-100">臺中榮總放射腫瘤科</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <User size={20} />
            <div className="text-right">
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-orange-100">{roleLabels[user?.role]}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="登出"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
