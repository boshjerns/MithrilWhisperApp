// Minimal Supabase client for renderer process
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Gracefully handle missing env vars in production builds by providing a no-op client
function createStubClient() {
  const noop = async () => ({ data: null, error: null });
  const getSession = async () => ({ data: { session: null }, error: null });
  const onAuthStateChange = (_cb) => ({ data: { subscription: { unsubscribe: () => {} } } });
  return {
    auth: {
      getSession,
      onAuthStateChange,
      signInWithPassword: async () => ({ data: null, error: new Error('Auth disabled: missing Supabase configuration') }),
      signUp: async () => ({ data: null, error: new Error('Auth disabled: missing Supabase configuration') }),
      signOut: noop,
    },
  };
}

let supabase;
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars are missing. Running with authentication disabled.');
  supabase = createStubClient();
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storage: window.localStorage,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}

export { supabase };


