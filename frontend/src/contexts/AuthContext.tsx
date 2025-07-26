import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user credentials
const DEMO_USER = {
  email: 'demo@medwrangler.com',
  password: 'demo123',
  name: 'Demo User'
};

const AUTH_STORAGE_KEY = 'medwrangler_auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        const userData = JSON.parse(savedAuth);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse saved auth data:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate API call delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Validate against demo user credentials
      if (email.toLowerCase() === DEMO_USER.email.toLowerCase() && password === DEMO_USER.password) {
        const userData = {
          email: DEMO_USER.email,
          name: DEMO_USER.name
        };
        
        setUser(userData);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
        setIsLoading(false);
        
        return { success: true };
      } else {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'Invalid email or password. Use demo@medwrangler.com / demo123' 
        };
      }
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
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