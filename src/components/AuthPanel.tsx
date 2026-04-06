import React, { useState } from 'react';
import {
  googleProvider,
  githubProvider,
  discordProvider,
  auth,
  signInWithPopup,
  signOut,
  User,
} from '../firebase';

interface AuthPanelProps {
  user: User | null;
  onAuthChange?: () => void;
  onPlayAsGuest?: () => void;
}

export function AuthPanel({ user, onAuthChange, onPlayAsGuest }: AuthPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (providerName: 'google' | 'github' | 'discord') => {
    setLoading(true);
    setError(null);
    try {
      const providers: { [key: string]: any } = {
        google: googleProvider,
        github: githubProvider,
        discord: discordProvider,
      };

      await signInWithPopup(auth, providers[providerName]);
      onAuthChange?.();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      onAuthChange?.();
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAsGuest = () => {
    onPlayAsGuest?.();
  };

  return (
    <div
      id="auth-section"
      style={{
        marginTop: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 2,
      }}
    >
      {!user ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            maxWidth: '300px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              color: 'rgba(100, 200, 255, 0.7)',
              fontFamily: "'Orbitron', monospace",
              letterSpacing: '1px',
              marginBottom: '10px',
            }}
          >
            AUTHENTICATE
          </div>
          <button
            className="start-btn"
            id="google-login-btn"
            onClick={() => handleLogin('google')}
            disabled={loading}
            style={{ width: '100%', background: 'rgba(66, 133, 244, 0.8)', marginTop: 0 }}
          >
            {loading ? 'CONNECTING...' : 'GOOGLE LOGIN'}
          </button>
          <button
            className="start-btn"
            id="github-login-btn"
            onClick={() => handleLogin('github')}
            disabled={loading}
            style={{ width: '100%', background: 'rgba(88, 96, 105, 0.8)', marginTop: '8px' }}
          >
            {loading ? 'CONNECTING...' : 'GITHUB LOGIN'}
          </button>
          <button
            className="start-btn"
            id="discord-login-btn"
            onClick={() => handleLogin('discord')}
            disabled={loading}
            style={{ width: '100%', background: 'rgba(114, 137, 218, 0.8)', marginTop: '8px' }}
          >
            {loading ? 'CONNECTING...' : 'DISCORD LOGIN'}
          </button>
          <div
            style={{
              width: '100%',
              height: '1px',
              background: 'rgba(100, 200, 255, 0.2)',
              margin: '12px 0',
            }}
          />
          <button
            className="start-btn"
            id="guest-play-btn"
            onClick={handlePlayAsGuest}
            disabled={loading}
            style={{
              width: '100%',
              background: 'rgba(150, 150, 150, 0.6)',
              marginTop: 0,
              fontSize: '12px',
            }}
          >
            {loading ? 'LOADING...' : 'PLAY AS GUEST'}
          </button>
          <div
            style={{
              fontSize: '10px',
              color: 'rgba(150, 150, 150, 0.6)',
              fontFamily: "'Orbitron', monospace",
              marginTop: '8px',
              textAlign: 'center',
            }}
          >
            (No account or data saved)
          </div>
          {error && (
            <div
              style={{
                color: 'rgba(255, 100, 100, 0.8)',
                fontSize: '12px',
                marginTop: '10px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}
        </div>
      ) : (
        <div
          id="user-info"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
        >
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '2px solid rgba(0,255,100,0.5)',
              }}
            />
          )}
          <div
            style={{
              color: 'rgba(0,255,100,0.8)',
              fontFamily: "'Orbitron', monospace",
              fontSize: '14px',
              letterSpacing: '2px',
            }}
            id="welcome-msg"
          >
            WELCOME, {(user.displayName || user.email)?.toUpperCase()}
          </div>
          <button
            id="logout-btn"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,100,100,0.8)',
              fontFamily: "'Orbitron', monospace",
              fontSize: '10px',
              cursor: 'pointer',
              letterSpacing: '2px',
              textDecoration: 'underline',
              marginTop: '10px',
            }}
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? 'DISCONNECTING...' : 'LOGOUT'}
          </button>
        </div>
      )}
    </div>
  );
}
