import { useState, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AuthApiError } from '../../api/auth';
import './AuthForm.css';

type AuthMode = 'login' | 'register';

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const validateEmail = useCallback((value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!email.trim() || !password.trim()) {
        setError('Please fill in all fields.');
        return;
      }

      if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }

      if (mode === 'register' && password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }

      setIsSubmitting(true);

      try {
        if (mode === 'login') {
          await login(email.trim(), password);
        } else {
          await register(email.trim(), password);
        }
      } catch (err) {
        if (err instanceof AuthApiError) {
          setError(err.message);
        } else {
          setError(
            mode === 'login' ? 'Login failed. Please try again.' : 'Registration failed. Please try again.'
          );
        }
        showToast('error', err instanceof AuthApiError ? err.message : 'An unexpected error occurred');
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, mode, validateEmail, login, register, showToast]
  );

  const handleModeSwitch = useCallback(() => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setError('');
  }, []);

  return (
    <div className="auth-form-wrapper">
      <div className="auth-form-card">
        {/* Header */}
        <div className="auth-form-header">
          <div className="auth-logo">
            <Zap size={28} aria-hidden="true" />
          </div>
          <h1 className="auth-title">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to access your files'
              : 'Join FluxShare to store and share files'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email */}
          <div className="form-field">
            <label htmlFor="auth-email" className="form-label">
              Email
            </label>
            <div className="form-input-wrapper">
              <Mail className="form-input-icon" size={18} aria-hidden="true" />
              <input
                id="auth-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
                required
                aria-describedby={error ? 'auth-error' : undefined}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-field">
            <label htmlFor="auth-password" className="form-label">
              Password
            </label>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon" size={18} aria-hidden="true" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder={mode === 'login' ? 'Enter your password' : 'Create a password (min 8 characters)'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={mode === 'register' ? 8 : undefined}
              />
              <button
                type="button"
                className="form-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="auth-spinner" size={18} aria-hidden="true" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : mode === 'login' ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        {/* Toggle between login/register */}
        <div className="auth-footer">
          <p className="auth-footer-text">
            {mode === 'login'
              ? "Don't have an account?"
              : 'Already have an account?'}
          </p>
          <button
            type="button"
            className="auth-footer-link"
            onClick={handleModeSwitch}
            disabled={isSubmitting}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
