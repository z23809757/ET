import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        const session = await authService.getSession();
        if (mounted) {
          setUser(session?.user || null);
          setInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

<<<<<<< HEAD
    // Fix: Properly handle the subscription
=======
>>>>>>> eead2da (Small Changes)
    const { data } = authService.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user || null);
        setLoading(false);
      }
    });
    
<<<<<<< HEAD
    subscription = data;
=======
    subscription = data.subscription;
>>>>>>> eead2da (Small Changes)

    return () => {
      mounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

<<<<<<< HEAD
  const signUp = async (email: string, password: string) => {
    await authService.signUp(email, password);
=======
  const signUp = async (email: string, password: string, data?: Record<string, unknown>) => {
    await authService.signUp(email, password, data);
>>>>>>> eead2da (Small Changes)
  };

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return { user, loading: loading || !initialized, signUp, signIn, signOut };
<<<<<<< HEAD
}
=======
}
>>>>>>> eead2da (Small Changes)
