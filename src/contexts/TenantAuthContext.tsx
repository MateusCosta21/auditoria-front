import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantAuthService, LoginCredentials } from '@/services/tenant/auth';
import { getErrorMessage } from '@/services/api-client';
import type { TenantUser } from '@/types/api';

interface TenantAuthContextType {
  user: TenantUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const TenantAuthContext = createContext<TenantAuthContextType | undefined>(undefined);

export function TenantAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TenantUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = tenantAuthService.getStoredUser();
      const token = tenantAuthService.getStoredToken();

      if (storedUser && token) {
        try {
          const currentUser = await tenantAuthService.getMe();
          setUser(currentUser);
        } catch {
          await tenantAuthService.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tenantAuthService.login(credentials);
      setUser(response.user);
      navigate('/tenant');
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await tenantAuthService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
      navigate('/tenant/login');
    }
  }, [navigate]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: TenantAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
    clearError,
  };

  return (
    <TenantAuthContext.Provider value={value}>
      {children}
    </TenantAuthContext.Provider>
  );
}

export function useTenantAuth() {
  const context = useContext(TenantAuthContext);
  if (context === undefined) {
    throw new Error('useTenantAuth must be used within a TenantAuthProvider');
  }
  return context;
}
