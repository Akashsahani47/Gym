// src/context/AuthContext.jsx
'use client';
import { createContext, useContext, useEffect } from 'react';
import useUserStore from '@/store/useUserStore';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { user, token, isAuthenticated, setUser, setToken, login, logout } = useUserStore();

  const checkAuthStatus = async () => {
    try {
      console.log('🔄 Checking auth status...');
      
      const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      console.log('📝 Stored token found:', storedToken ? `YES` : 'NO');
      
      if (!storedToken) {
        console.log('❌ No token found in storage');
        logout();
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      
      console.log('📤 Sending request to:', `${backendUrl}/api/auth/me`);
      
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      console.log('📡 Auth check response status:', response.status);
      
      const data = await response.json();
      console.log('📊 Auth check response data:', data);
      
      if (response.ok && data.user) {
        setUser(data.user);
        setToken(storedToken);
        console.log('✅ User authenticated:', data.user.profile?.firstName);
      } else {
        console.log('❌ Auth failed. Message:', data.message);
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        logout();
      }
    } catch (error) {
      console.error('💥 Auth check failed:', error.message);
      logout();
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    login: (userData, authToken, rememberMe = true) => {
      console.log('🔐 Login called with user:', userData?.profile?.firstName);
      
      if (authToken) {
        if (rememberMe) {
          localStorage.setItem("authToken", authToken);
        } else {
          sessionStorage.setItem("authToken", authToken);
        }
        console.log('💾 Token saved to storage');
      }
      
      login(userData, authToken);
    },
    logout: () => {
      console.log('🚪 Logout called');
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      logout();
    },
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};