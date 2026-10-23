import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApiService, BackendUser } from '../services/auth';
import usersApiService, { UserProfile } from '../services/users';
import { authService } from './authService';

interface AuthContextType {
  user: User | null;
  backendUser: BackendUser | null;
  userProfile: UserProfile | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      console.log('Firebase auth state changed. User:', firebaseUser);
      if (firebaseUser) {
        try {
          // Try to get stored token
          const storedToken = await AsyncStorage.getItem('authToken');
          if (storedToken) {
            setToken(storedToken);
            // Verify token with backend
            const backendUserData = await authApiService.verifyToken();
            setBackendUser(backendUserData);
          } else {
            // Authenticate with backend using Firebase UID
            const authResponse = await authApiService.authenticateWithFirebase(
              firebaseUser.uid,
              firebaseUser.email || '',
              firebaseUser.displayName || '',
              firebaseUser.phoneNumber || undefined
            );
            setToken(authResponse.token);
            setBackendUser(authResponse.user);
          }
        } catch (error) {
          console.error('Backend authentication error:', error);
          // Clear stored token if invalid
          await AsyncStorage.removeItem('authToken');
        }
      } else {
        // User signed out
        setToken(null);
        setBackendUser(null);
        setUserProfile(null);
        await AsyncStorage.removeItem('authToken');
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fetch user profile when backendUser is available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (backendUser) {
        try {
          const profile = await usersApiService.getUserProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to default values if API fails
          setUserProfile({
            id: backendUser.id,
            email: backendUser.email,
            display_name: backendUser.name,
            phone: backendUser.phone || '',
            profile_image: backendUser.profile_image || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [backendUser]);

  const signIn = async (email: string, password: string) => {
    await authService.signInWithEmail(email, password);
  };

  const signUp = async (email: string, password: string, name?: string, phone?: string) => {
    const userCredential = await authService.signUpWithEmail(email, password);
    const firebaseUser = userCredential.user;
    // Authenticate with backend to duplicate user in MySQL
    const authResponse = await authApiService.authenticateWithFirebase(
      firebaseUser.uid,
      firebaseUser.email || '',
      name || firebaseUser.displayName || '',
      phone || firebaseUser.phoneNumber || undefined
    );
    setToken(authResponse.token);
    setBackendUser(authResponse.user);
    // Store token for persistence
    await AsyncStorage.setItem('authToken', authResponse.token);
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const value: AuthContextType = {
    user,
    backendUser,
    userProfile,
    token,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
