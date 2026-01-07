import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import MyStatsPage from './pages/MyStatsPage';
import CasesPage from './pages/cases/CasesPage';
import UnconfirmedPage from './pages/cases/UnconfirmedPage';
import ImportPage from './pages/cases/ImportPage';
import PointsPage from './pages/points/PointsPage';
import StaffPage from './pages/staff/StaffPage';
import CaseTypesPage from './pages/settings/CaseTypesPage';
import SystemPage from './pages/settings/SystemPage';
import AuditLogPage from './pages/settings/AuditLogPage';
import ReportsPage from './pages/reports/ReportsPage';
import Loading from './components/common/Loading';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  // 未登入
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 需要修改密碼
  if (user.mustChangePassword) {
    return (
      <Routes>
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="*" element={<Navigate to="/change-password" replace />} />
      </Routes>
    );
  }

  const isAdmin = ['super_admin', 'admin'].includes(user.role);

  // 已登入
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/my-stats" element={<MyStatsPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        
        {/* 管理者專用路由 */}
        {isAdmin && (
          <>
            <Route path="/unconfirmed" element={<UnconfirmedPage />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/points" element={<PointsPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/case-types" element={<CaseTypesPage />} />
            <Route path="/system" element={<SystemPage />} />
            <Route path="/audit" element={<AuditLogPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </>
        )}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
