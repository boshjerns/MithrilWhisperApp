import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext({ user: null, session: null, signIn: async () => {}, signUp: async () => {}, signOut: async () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const { ipcRenderer } = window.require('electron');

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        ipcRenderer.send('auth:signed-in', {
          user: { id: data.session.user.id, email: data.session.user.email },
          accessToken: data.session.access_token,
        });
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        ipcRenderer.send('auth:signed-in', {
          user: { id: newSession.user.id, email: newSession.user.email },
          accessToken: newSession.access_token,
        });
        // Flush any queued usage events now that we're authenticated
        import('../usage/uploader').then(mod => mod.flushQueue && mod.flushQueue()).catch(() => {});
      } else {
        ipcRenderer.send('auth:signed-out');
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(() => ({ user, session, signIn, signUp, signOut }), [user, session, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


