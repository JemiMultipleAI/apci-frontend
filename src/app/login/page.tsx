'use client';

import { useState } from 'react';
import apiClient from '@/lib/api/client';
import { setAccessToken, setRefreshToken, setCompanyId } from '@/lib/cookies';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      if (response.data.success && response.data.data) {
        // Store tokens in cookies
        setAccessToken(response.data.data.accessToken);
        setRefreshToken(response.data.data.refreshToken);
        
        // Store company_id in cookies
        const companyId = response.data.data.user?.company_id || response.data.data.company_id || null;
        setCompanyId(companyId);
        
        // Navigate to portal - use window.location for reliable navigation
        // This ensures cookies are available to the middleware immediately
        window.location.href = '/portal';
      } else {
        setError('Login failed. Invalid response from server.');
        setLoading(false);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 
                          err.message || 
                          'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 bg-gradient-mesh">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-xl glass">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-tech flex items-center justify-center shadow-lg glow-cyan">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">CRMatIQ</h1>
          </div>
          <p className="mt-2 text-muted-foreground">Your CRM — On Auto-Pilot</p>
          <h2 className="mt-6 text-2xl font-semibold text-foreground">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-error/10 border border-error/30 p-3 text-sm text-error">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 btn-tech"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? Please contact us for more details.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
