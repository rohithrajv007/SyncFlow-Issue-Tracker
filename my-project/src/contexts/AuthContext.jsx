import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Create the context
const AuthContext = createContext(null);

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  // This effect runs when the app starts to check for a token in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Set the auth token for all future api requests
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context easily
export const useAuth = () => {
  return useContext(AuthContext);
};