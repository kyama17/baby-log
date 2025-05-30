import { supabase } from '../lib/supabaseClient';
import { User, AuthChangeEvent, Session, SignUpWithPasswordCredentials, SignInWithPasswordCredentials, AuthError } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const getCurrentSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getCurrentSession();

    const { data: authListenerData } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      // The authListenerData itself is { data: { subscription }, error: null | AuthError }
      // So we need to access authListenerData.subscription to unsubscribe
      authListenerData?.subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (credentials: SignUpWithPasswordCredentials) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp(credentials);
    setLoading(false);
    return { data, error };
  };

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    return { error };
  };

  const getCurrentUser = async () => {
    const { data: { user } , error } = await supabase.auth.getUser();
    return { user, error };
  };

  return { user, loading, signUp, signIn, signOut, getCurrentUser };
}
