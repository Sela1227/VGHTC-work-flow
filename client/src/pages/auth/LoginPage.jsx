import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    employeeId: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData.employeeId, formData.password);

      // 如果需要改密碼，導向改密碼頁
      if (user.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.error?.message || '登入失敗，請稍後再試';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo 區塊 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-sela-orange rounded-2xl shadow-lg mb-4">
            <img
              src="/logo.png"
              alt="SELA Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            劑量室工作分配系統
          </h1>
          <p className="text-gray-500 mt-1">
            臺中榮總放射腫瘤科
          </p>
        </div>

        {/* 登入表單 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            歡迎回來
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="員工編號"
              name="employeeId"
              type="text"
              placeholder="請輸入員工編號"
              value={formData.employeeId}
              onChange={handleChange}
              required
              autoFocus
            />

            <Input
              label="密碼"
              name="password"
              type="password"
              placeholder="請輸入密碼"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
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

          <p className="text-center text-sm text-gray-400 mt-6">
            首次登入請使用預設密碼
          </p>
        </div>

        {/* 版權資訊 */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 SELA Workload System
        </p>
      </div>
    </div>
  );
}
