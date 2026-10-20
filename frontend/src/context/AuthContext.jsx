import { useState, useCallback } from 'react';
import API from '../api';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './authContextDef';

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');

    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 >= Date.now()) {
          return JSON.parse(storedUser);
        }
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } catch {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }
    return null;
  });

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/api/auth/login', { email, password });
    sessionStorage.setItem('token', res.data.token);
    sessionStorage.setItem('user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const register = async (name, email, password, role, consultationFee) => {
    const res = await API.post('/api/auth/register', { name, email, password, role, consultationFee });
    sessionStorage.setItem('token', res.data.token);
    sessionStorage.setItem('user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};
