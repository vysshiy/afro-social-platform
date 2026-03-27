import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(160deg, #0a0a1a 0%, #0f0f2a 100%)' }}
    >
      {/* Logo */}
      <div className="text-center mb-10">
        <div
          className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #d4a017, #8b6508)' }}
        >
          <span className="text-4xl">✊🏿</span>
        </div>
        <h1
          className="text-3xl font-bold"
          style={{
            background: 'linear-gradient(135deg, #d4a017, #f59e0b, #fff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Afro Social
        </h1>
        <p className="text-white/40 text-sm mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="afro-input"
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              className="afro-input pr-16"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white/80"
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-400 text-center py-2 px-3 rounded-xl bg-red-500/10 border border-red-500/20">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2">
          Sign In
        </Button>
      </form>

      <p className="mt-8 text-sm text-white/40 text-center">
        Don't have an account?{' '}
        <Link to="/register" className="text-afro-gold hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
