import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isForced = user?.mustChangePassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('新密碼與確認密碼不符');
      return;
    }

    if (newPassword.length < 4) {
      setError('新密碼至少需要 4 個字元');
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword(currentPassword, newPassword);
      updateUser({ mustChangePassword: false });
      alert('密碼修改成功');
      navigate('/');
    } catch (err) {
      setError(err.message || '密碼修改失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
            {isForced ? '首次登入請修改密碼' : '修改密碼'}
          </h2>

          {isForced && (
            <p className="text-center text-gray-500 text-sm mb-6">
              為了帳號安全，請設定新密碼
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="目前密碼"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="請輸入目前密碼"
              required
            />

            <Input
              label="新密碼"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="請輸入新密碼 (至少 4 字元)"
              required
            />

            <Input
              label="確認新密碼"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="請再次輸入新密碼"
              required
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {!isForced && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  取消
                </Button>
              )}
              <Button
                type="submit"
                loading={loading}
                className={isForced ? 'w-full' : 'flex-1'}
              >
                確認修改
              </Button>
            </div>

            {isForced && (
              <button
                type="button"
                onClick={logout}
                className="w-full text-center text-gray-500 text-sm hover:text-gray-700"
              >
                返回登入頁
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
