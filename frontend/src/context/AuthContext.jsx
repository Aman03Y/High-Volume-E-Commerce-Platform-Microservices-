import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState(() => localStorage.getItem('auth_role') || 'CUSTOMER');

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
    if (role) {
      localStorage.setItem('auth_role', role);
    } else {
      localStorage.removeItem('auth_role');
    }
  }, [role]);

  const loginUser = (jwtToken, userDetails, requestedRole = null) => {
    // Auto-detect role: If explicitly ADMIN or email contains 'admin', set role to ADMIN
    const email = userDetails?.email?.toLowerCase() || '';
    const assignedRole = requestedRole === 'ADMIN' || email.includes('admin') ? 'ADMIN' : (requestedRole || 'CUSTOMER');

    setToken(jwtToken || `token_${Date.now()}`);
    setUser(userDetails);
    setRole(assignedRole);
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    setRole('CUSTOMER');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
  };

  const isAdmin = user !== null && (role === 'ADMIN' || (user?.email && user.email.toLowerCase().includes('admin')));

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAdmin,
        isAuthenticated: !!user,
        loginUser,
        logoutUser,
      }}
    >
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
