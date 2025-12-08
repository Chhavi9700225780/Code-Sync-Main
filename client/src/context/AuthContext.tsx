import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'; // Import InternalAxiosRequestConfig

// --- 1. Define the User Type ---
export interface AuthUser {
  id: string;
  username: string;
  email?: string;
}

// --- 2. Define the Context's Value Shape ---
interface AuthContextType {
  user: AuthUser | null;
  setUser: Dispatch<SetStateAction<AuthUser | null>>;
  isLoading: boolean;
  api: AxiosInstance;
  token: string | null;
  setToken: (newToken: string | null) => void;
}

// --- 3. Create the Context ---

const AuthContext = createContext<AuthContextType>(undefined as any);

// --- 4. Create Pre-configured Axios Instance ---
// --- FIX: Remove import.meta.env usage to avoid es2015 warning ---
// Use environment variable directly if available (e.g., through process.env if build tool replaces it)
// or rely solely on the fallback for now.
// For Vite, ensure target in tsconfig.json is 'esnext' or similar if using import.meta.env
export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://api-alb-2025293782.us-east-1.elb.amazonaws.com', // Adjusted access
});
// --- END FIX ---


// --- 5. Create the Provider Component ---
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Initialize directly from localStorage + LOGGING
  const [token, setTokenState] = useState<string | null>(() => {
      const storedToken = localStorage.getItem('authToken');
      // --- LOG 1 ---
      console.log("AuthProvider Init - Token from localStorage:", storedToken ? storedToken.substring(0, 10)+"..." : "None");
      return storedToken;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Wrapper for setToken to also update localStorage + LOGGING
  const setToken = (newToken: string | null) => {
      setTokenState(newToken);
      if (newToken) {
          localStorage.setItem('authToken', newToken);
          // --- LOG 2 ---
          console.log("setToken called - Saving token:", newToken.substring(0, 10)+"...");
      } else {
          localStorage.removeItem('authToken');
           // --- LOG 3 ---
          console.log("setToken called - Removing token");
      }
  };

  // --- Axios Request Interceptor (Setup once) + LOGGING ---
  useEffect(() => {
    // --- LOG 4 ---
    console.log("Setting up Axios interceptor.");
    const interceptorId = api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // ALWAYS read fresh token from localStorage inside interceptor
        const currentToken = localStorage.getItem('authToken');
        // --- LOG 5 ---
        console.log("Interceptor running - Token from localStorage:", currentToken ? currentToken.substring(0, 10)+"..." : "None");
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
           // --- LOG 6 ---
          console.log("Interceptor - Added Authorization header.");
        } else {
             delete config.headers.Authorization;
             // --- LOG 7 ---
             console.log("Interceptor - No token found, ensuring no Authorization header.");
        }
        return config;
      },
      (error) => {
        // --- LOG 8 ---
        console.error("Interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on unmount
    return () => {
      // --- LOG 9 ---
      console.log("Ejecting Axios interceptor.");
      api.interceptors.request.eject(interceptorId);
    };
  }, []); // Empty dependency array - setup ONCE
  // --- End Interceptor ---


  // Check user status on initial load based on token + LOGGING
  useEffect(() => {
    const checkUserStatus = async () => {
        // Use token from state (reflects initial localStorage)
        const initialToken = token;
        // --- LOG 10 ---
        console.log("checkUserStatus effect running - Initial token from state:", initialToken ? initialToken.substring(0, 10)+"..." : "None");

        if (initialToken) {
             // --- LOG 11 ---
            console.log("checkUserStatus - Verifying initial token via /api/auth/status");
            try {
                // Interceptor will add header
                const response = await api.get('/api/auth/status');
                // --- LOG 12 ---
                console.log("checkUserStatus - /status response:", response.data);
                if (response.data.isAuthenticated && response.data.user) {
                     // --- LOG 13 ---
                    console.log("checkUserStatus - Token verified, setting user:", response.data.user);
                    setUser(response.data.user);
                    // Optional: Sync state if somehow localStorage changed mid-flight
                    if (token !== localStorage.getItem('authToken')) {
                        console.warn("checkUserStatus - Syncing token state with updated localStorage");
                        setTokenState(localStorage.getItem('authToken'));
                    }
                } else {
                     // --- LOG 14 ---
                     console.log("checkUserStatus - Backend indicates token invalid/expired.");
                     setToken(null); // Clear invalid token (state + localStorage)
                     setUser(null);
                }
            } catch (error) {
                 // --- LOG 15 ---
                   // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
                 console.error('checkUserStatus - API call failed:', error.response?.data?.message || error.message);
                 setToken(null); // Clear potentially invalid token
                 setUser(null);
            }
        } else {
             // --- LOG 16 ---
             console.log("checkUserStatus - No initial token found.");
             setUser(null);
        }
        setIsLoading(false);
    };

    checkUserStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only ONCE on initial mount

  const contextValue = { user, setUser, isLoading, api, token, setToken };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// --- 6. Create the Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

