'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Device token storage key
const DEVICE_TOKEN_KEY = 'darwin_device_token';

/**
 * Get or generate a unique device token for this browser/device
 * This persists across sessions to identify the device
 */
const getDeviceToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  let deviceToken = localStorage.getItem(DEVICE_TOKEN_KEY);
  return deviceToken;
};

/**
 * Store the device token received from the server
 */
const setDeviceToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEVICE_TOKEN_KEY, token);
};

/**
 * Clear device token (used on logout or when device is reset)
 */
const clearDeviceToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEVICE_TOKEN_KEY);
};

interface User {
  id: string;
  user_code: string;
  email: string;
  name: string;
  full_name?: string; // Alias for compatibility
  role: 'student' | 'admin' | 'instructor';
  avatar_url?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; user_code?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Wake up backend on mount (for Render.com free tier)
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        // Ping health endpoint to wake up sleeping backend
        await fetch(`${API_BASE_URL}/health`, { 
          method: 'GET',
          mode: 'cors'
        });
      } catch (error) {
        console.log('Backend wake-up ping sent');
      }
    };
    
    wakeUpBackend();
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string, retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Check if device was changed/reset by admin
        const errorData = await response.json().catch(() => ({}));
        if (errorData.code === 'DEVICE_CHANGED') {
          // Device binding was reset - clear device token so user can re-bind
          clearDeviceToken();
        }
        
        // Token is invalid or expired
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      
      // Retry if backend might be sleeping (Render.com free tier)
      if (retryCount < maxRetries) {
        console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchUser(authToken, retryCount + 1);
      }
      
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      if (retryCount === 0 || retryCount >= maxRetries) {
        setIsLoading(false);
      }
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; code?: string }> => {
    try {
      // Get existing device token if any (to maintain device binding)
      const existingDeviceToken = getDeviceToken();
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          deviceToken: existingDeviceToken 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        
        // Store device token if provided (for non-admin users)
        if (data.deviceToken) {
          setDeviceToken(data.deviceToken);
        }
        
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed', code: data.code };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    fullName: string
  ): Promise<{ success: boolean; error?: string; user_code?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name: fullName }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user_code: data.user.user_code };
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (token) {
      await fetchUser(token);
    }
  }, [token]);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
