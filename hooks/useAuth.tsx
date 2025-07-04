import apiClient from '@/utils/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  user: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const tokenExpiry = await AsyncStorage.getItem('tokenExpiry');
      const userData = await AsyncStorage.getItem('userData');

      if (token && tokenExpiry && userData) {
        const expiryTime = parseInt(tokenExpiry);
        const currentTime = Date.now();

        if (currentTime < expiryTime) {
          // Token is still valid
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          // Token has expired
          await logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.post('login.php', {
        username,
        password,
      });

      if (response.data.res === 2 && response.status===200) {
        // Login successful
        const token = response.data.token || 'dummy-token-' + Date.now();
        const expiryTime = Date.now() + (2 * 24 * 60 * 60 * 1000); // 2 days from now
        const userData = { username:response.data.username , id: response.data.login_id  || '1' };

        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('tokenExpiry', expiryTime.toString());
        await AsyncStorage.setItem('userData', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, message: 'Logged in successfully' };
      } else {
        // Login failed
        return { success: false, message: response.data.msg || 'Credentials are incorrect' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.msg || 'Network error. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('tokenExpiry');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 