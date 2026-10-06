import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure axios base url to backend API port
export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ks_token'));
  const [loading, setLoading] = useState(true);

  // Set default auth header whenever token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('ks_token', token);
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch profile to verify token integrity
      API.get('/auth/profile')
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          console.error('Session restore failed:', err.message);
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('ks_token');
      delete API.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      throw err.response?.data?.message || 'Login failed. Please verify credentials.';
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/admin/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      throw err.response?.data?.message || 'Admin login failed. Please verify credentials.';
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password, phone) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { 
        full_name: fullName, 
        email, 
        password, 
        phone 
      });
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      throw err.response?.data?.message || 'Registration failed.';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ks_token');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginAdmin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
