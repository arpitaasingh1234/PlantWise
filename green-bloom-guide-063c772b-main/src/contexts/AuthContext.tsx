import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto signout on page load for old sessions
  useEffect(() => {
    const validateAndSignOutOldSessions = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const sessionAge = Date.now() - new Date(session.created_at).getTime();
          const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          
          // Check if session is expired or older than 24 hours
          const currentTime = Math.floor(Date.now() / 1000);
          const sessionExpiresAt = session.expires_at ? Math.floor(new Date(session.expires_at).getTime() / 1000) : currentTime + 86400; // Default 24 hours
          
          if (sessionAge > maxSessionAge || currentTime >= sessionExpiresAt) {
            console.log('Old or expired session detected, signing out automatically');
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            
            // Notify user about automatic signout
            toast.info('Your session has expired. You have been automatically signed out. Please sign in again.', {
              duration: 6000,
              action: {
                label: 'Sign In',
                onClick: () => {
                  window.location.href = '/auth';
                }
              }
            });
          }
        }
      } catch (error) {
        console.error('Error validating session:', error);
        // If we can't validate session, sign out for safety
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        
        toast.error('Session validation failed. You have been signed out for security. Please sign in again.', {
          duration: 5000,
          action: {
            label: 'Sign In',
            onClick: () => {
              window.location.href = '/auth';
            }
          }
        });
      }
    };

    validateAndSignOutOldSessions();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName },
      },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
