import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '@/types';
import { api } from '@/services/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  changePassword: (oldPassword?: string, newPassword?: string) => Promise<void>;
  familyUsers: UserProfile[];
  fetchFamilyUsers: () => Promise<void>;
  createUser: (user: Partial<UserProfile> & { password?: string }) => Promise<void>;
  updateUser: (uid: string, user: Partial<UserProfile> & { password?: string }) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
}

const AUTH_STORAGE_KEY = 'sound-it-out-auth-profile-v2';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Lỗi đọc auth storage:', e);
    }
    return null;
  });

  const [familyUsers, setFamilyUsers] = useState<UserProfile[]>([]);

  const fetchFamilyUsers = async () => {
    if (user) {
      try {
        const users = await api.getUsers();
        setFamilyUsers(users);
      } catch (e) {
        console.warn('Lỗi lấy danh sách người dùng:', e);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchFamilyUsers();
    }
  }, [user]);

  const login = async (email: string, password?: string) => {
    const userProfile = await api.login(email, password);
    setUser(userProfile);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Lỗi lưu auth storage:', e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
  };

  const changePassword = async (oldPassword?: string, newPassword?: string) => {
    if (!user) throw new Error('Chưa đăng nhập');
    await api.changePassword(user.uid, oldPassword, newPassword);
  };

  const createUser = async (newUserData: Partial<UserProfile> & { password?: string }) => {
    await api.createUser(newUserData);
    await fetchFamilyUsers();
  };

  const updateUser = async (uid: string, updatedUserData: Partial<UserProfile> & { password?: string }) => {
    await api.updateUser(uid, updatedUserData);
    await fetchFamilyUsers();
    if (user && user.uid === uid) {
      const refreshed = { ...user, ...updatedUserData };
      setUser(refreshed as UserProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(refreshed));
    }
  };

  const deleteUser = async (uid: string) => {
    await api.deleteUser(uid);
    await fetchFamilyUsers();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      changePassword,
      familyUsers,
      fetchFamilyUsers,
      createUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
