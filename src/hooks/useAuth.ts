import { supabase } from '../lib/supabaseClient';
import { User, AuthChangeEvent, Session, SignUpWithPasswordCredentials, SignInWithPasswordCredentials, AuthError } from '@supabase/supabase-js';
import { useState, useEffect, useRef } from 'react';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // 初期セッションを取得
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (isMounted) {
          if (error) {
            console.error('Error getting session:', error);
          }
          setUser(session?.user ?? null);
          setInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setUser(null);
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    // 初期化がまだの場合のみ実行
    if (!initialized) {
      initializeAuth();
    }

    // Auth状態変更リスナーを設定
    const { data: authListenerData } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (isMounted && mountedRef.current) {
          setUser(session?.user ?? null);
          
          // 初期化後のみローディングを false に
          if (initialized) {
            setLoading(false);
          }
        }
      }
    );

    // クリーンアップ関数
    return () => {
      isMounted = false;
      authListenerData?.subscription?.unsubscribe();
    };
  }, [initialized]); // initializedを依存配列に追加

  // コンポーネントのアンマウント時の処理
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const signUp = async (credentials: SignUpWithPasswordCredentials) => {
    try {
      const { data, error } = await supabase.auth.signUp(credentials);
      return { data, error };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      
      if (!error && data.user) {
        // ログイン成功時は auth listener が状態を更新するのを待つ
        // setLoading(false) は onAuthStateChange で実行される
      } else {
        setLoading(false);
      }
      
      return { data, error };
    } catch (error) {
      setLoading(false);
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        // サインアウト成功時は auth listener が状態を更新するのを待つ
      } else {
        setLoading(false);
      }
      
      return { error };
    } catch (error) {
      setLoading(false);
      return { error: error as AuthError };
    }
  };

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  return { 
    user, 
    loading, 
    initialized, // 初期化状態も返す
    signUp, 
    signIn, 
    signOut, 
    getCurrentUser 
  };
}
