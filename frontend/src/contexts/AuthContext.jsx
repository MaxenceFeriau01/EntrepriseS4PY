import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/users/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post('http://localhost:8080/api/auth/login', {
      email,
      password,
    });
    const { accessToken, user: userData } = response.data;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    return userData;
  };

  const register = async (userData) => {
    const response = await axios.post('http://localhost:8080/api/auth/register', userData);
    const { accessToken, user: newUser } = response.data;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(newUser);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
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