import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('auth_user') || 'null'));
  const [role, setRoleState] = useState(localStorage.getItem('auth_role') || 'CUSTOMER'); // 'CUSTOMER' | 'ADMIN'

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('auth_role', role);
  }, [role]);

  const loginUser = (jwtToken, userDetails, assignedRole = 'CUSTOMER') => {
    setToken(jwtToken);
    setUser(userDetails);
    setRoleState(assignedRole);
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    setRoleState('CUSTOMER');
  };

  const switchRole = (newRole) => {
    setRoleState(newRole);
  };

  return (
    <AuthContext.Provider value={{ token, user, role, setRole: switchRole, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
