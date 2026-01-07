import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // 自動登出時間 (10 分鐘)
  const TIMEOUT = 10 * 60 * 1000;

  // 檢查 token 並載入使用者
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService
        .me()
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // 自動登出
  useEffect(() => {
    if (!user) return;

    const checkActivity = () => {
      if (Date.now() - lastActivity > TIMEOUT) {
        logout();
        alert('已超過 10 分鐘未操作，請重新登入');
      }
    };

    const interval = setInterval(checkActivity, 60000);

    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('click', updateActivity);
    window.addEventListener('keypress', updateActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keypress', updateActivity);
    };
  }, [user, lastActivity]);

  const login = async (employeeId, password) => {
    const data = await authService.login(employeeId, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setLastActivity(Date.now());
    return data.user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
