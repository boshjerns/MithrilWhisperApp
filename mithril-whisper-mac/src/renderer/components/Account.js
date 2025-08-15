import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

function Account() {
  const { user, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (val) => /.+@.+\..+/.test(val);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (!isValidEmail(email)) {
        throw new Error('Please enter a valid email');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        const { data } = await signUp(email, password);
        // If confirmation is required, Supabase returns user but no session
        if (!data?.session) {
          setMessage('Account created. Please check your email to confirm, then sign in.');
        } else {
          setMessage('Account created and signed in.');
        }
      }
    } catch (err) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="glass-card">
        <h2>Account</h2>
        <p className="terminal-text">Signed in as: {user.email}</p>
        <button onClick={signOut} className="button">Sign out</button>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <h2>{mode === 'signin' ? 'Sign in' : 'Sign up'}</h2>
      <form onSubmit={handleAuth} style={{ display: 'grid', gap: 12 }} onClick={(e) => e.stopPropagation()}>
        <div>
          <div className="input-label">Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            spellCheck={false}
            autoCapitalize="none"
            className="input-field"
          />
        </div>
        <div>
          <div className="input-label">Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            required
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            className="input-field"
          />
        </div>
        {error && <div className="error-text" role="alert">{error}</div>}
        {message && <div className="terminal-text">{message}</div>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Working…' : (mode === 'signin' ? 'Sign in' : 'Create account')}
        </button>
      </form>
      <div style={{ marginTop: 12 }}>
        <button className="link" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage(''); }}>
          {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

export default Account;


