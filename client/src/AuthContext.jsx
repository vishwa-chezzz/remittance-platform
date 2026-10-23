import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On page load, restore session from the saved token
  useEffect(() => {
    if (!localStorage.getItem('token')) return setLoading(false);
    api('/auth/me').then((d) => setUser(d.user)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, body) => {
    const d = await api(path, { method: 'POST', body });
    localStorage.setItem('token', d.token);
    setUser(d.user);
  };
  const login = (email, password) => authenticate('/auth/login', { email, password });
  const register = (form) => authenticate('/auth/register', form);
  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
