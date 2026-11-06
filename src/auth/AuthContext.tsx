import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateProfile, User } from 'firebase/auth';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from './authService';
import { deleteProfilePhotoFile, pickAndSaveProfilePhoto } from './profilePhoto';

// Profile built entirely from Firebase Auth. Firebase has no field for a free-form
// phone number on email/password accounts, so phone (and the profile photo) are kept
// on-device per user.
export interface UserProfile {
  id: string; // Firebase uid
  email: string;
  display_name: string;
  phone: string;
  profile_image: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  display_name?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: UpdateProfileData) => Promise<void>;
  /** Opens the photo library; resolves true if a new picture was saved. */
  changeProfilePhoto: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const phoneKey = (uid: string) => `userPhone:${uid}`;
const photoKey = (uid: string) => `userPhoto:${uid}`;

const buildProfile = (u: User, phone: string, photo: string): UserProfile => ({
  id: u.uid,
  email: u.email || '',
  display_name: u.displayName || u.email?.split('@')[0] || '',
  phone: phone || u.phoneNumber || '',
  profile_image: photo || u.photoURL || '',
  created_at: u.metadata.creationTime
    ? new Date(u.metadata.creationTime).toISOString()
    : new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async (u: User | null) => {
    if (!u) {
      setUserProfile(null);
      return;
    }
    let phone = '';
    let photo = '';
    try {
      const [[, p], [, ph]] = await AsyncStorage.multiGet([phoneKey(u.uid), photoKey(u.uid)]);
      phone = p || '';
      photo = ph || '';
    } catch {}
    setUserProfile(buildProfile(u, phone, photo));
  }, []);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      await refreshProfile(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [refreshProfile]);

  const signIn = async (email: string, password: string) => {
    await authService.signInWithEmail(email, password);
  };

  const signUp = async (email: string, password: string, name?: string, phone?: string) => {
    const { user: newUser } = await authService.signUpWithEmail(email, password);
    if (name) {
      await updateProfile(newUser, { displayName: name });
    }
    if (phone) {
      await AsyncStorage.setItem(phoneKey(newUser.uid), phone);
    }
    await refreshProfile(newUser);
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const updateUserProfile = async (data: UpdateProfileData) => {
    const current = authService.getCurrentUser();
    if (!current) throw new Error('You are not signed in.');
    if (data.display_name !== undefined) {
      await updateProfile(current, { displayName: data.display_name });
    }
    if (data.phone !== undefined) {
      await AsyncStorage.setItem(phoneKey(current.uid), data.phone);
    }
    await refreshProfile(current);
  };

  const changeProfilePhoto = async () => {
    const current = authService.getCurrentUser();
    if (!current) throw new Error('You are not signed in.');
    const uri = await pickAndSaveProfilePhoto(current.uid);
    if (!uri) return false;
    const previous = await AsyncStorage.getItem(photoKey(current.uid));
    await AsyncStorage.setItem(photoKey(current.uid), uri);
    await deleteProfilePhotoFile(previous);
    await refreshProfile(current);
    return true;
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    changeProfilePhoto,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
