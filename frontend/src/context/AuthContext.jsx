import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api, { setAuthToken } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // No localStorage — token lives only in memory.
  // On any page refresh/restart the token is gone → user must log in again.
  const loading = false;
  const heartbeatRef = useRef(null);

  // Heartbeat: ping every 2 min, only when tab is visible.
  // This is the sole mechanism that marks the user as "active" for maintenance scheduling.
  useEffect(() => {
    const INTERVAL = 2 * 60 * 1000;

    const start = () => {
      if (heartbeatRef.current) return;
      heartbeatRef.current = setInterval(() => {
        if (!document.hidden) api.get('/auth/ping').catch(() => {});
      }, INTERVAL);
      // Immediate ping on start
      api.get('/auth/ping').catch(() => {});
    };

    const stop = () => {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop(); else if (user) start();
    };

    if (user) {
      start();
      document.addEventListener('visibilitychange', onVisibilityChange);
    }

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [user]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const refreshUser = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
