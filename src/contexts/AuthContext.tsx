'use client';

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth'; // Assuming useAuth returns signIn, signUp, signOut with specific signatures

// Define the return type of useAuth if not explicitly available
// This is a conceptual step. In practice, you'd import this or ensure useAuth has a clear return type.
type UseAuthReturn = ReturnType<typeof useAuth>;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // Infer types from useAuth return for signIn, signUp, signOut
  signIn: UseAuthReturn['signIn'];
  signUp: UseAuthReturn['signUp'];
  signOut: UseAuthReturn['signOut'];
  // error: string | null; // Optional: Add error state if you plan to manage it here
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading, signIn, signUp, signOut } = useAuth();

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
