import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function LoginPage() {
  const { login } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(employeeId, password);
    } catch (err) {
      setError(err.message || '登入失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-sela-orange rounded-2xl shadow-lg mb-4">
            <img src="/logo.png" alt="SELA" className="w-20 h-20" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">劑量室工作分配系統</h1>
          <p className="text-gray-500 mt-1">臺中榮總放射腫瘤科</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
            登入
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="員工編號"
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="請輸入員工編號"
              required
              autoFocus
            />

            <Input
              label="密碼"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              required
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              登入
            </Button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          © 2024 SELA Workload System
        </p>
      </div>
    </div>
  );
}
