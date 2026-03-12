import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IllustrationLoginHero } from '../components/Illustrations';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const next = { email: '', password: '' };
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Please enter a valid email';
    if (!password) next.password = 'Password is required';
    setFieldErrors(next);
    return !next.email && !next.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ email: '', password: '' });
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field) => {
    if (field === 'email') {
      if (!email.trim()) setFieldErrors((e) => ({ ...e, email: '' }));
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setFieldErrors((e) => ({ ...e, email: 'Please enter a valid email' }));
      else setFieldErrors((e) => ({ ...e, email: '' }));
    }
    if (field === 'password') {
      if (!password) setFieldErrors((e) => ({ ...e, password: 'Password is required' }));
      else setFieldErrors((e) => ({ ...e, password: '' }));
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel login-panel-brand">
        <div className="login-brand-content">
          <div className="login-logo" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
            <span className="login-logo-icon" aria-hidden>BRD</span>
            <span className="login-logo-text">BRD Institute</span>
          </div>
          <p className="login-tagline">
            Student Enrollment Management — from inquiry to enrollment, in one place.
          </p>
          <div className="login-decoration" aria-hidden>
            <div className="login-dot" />
            <div className="login-dot" />
            <div className="login-dot" />
          </div>
          <IllustrationLoginHero />
        </div>
      </div>

      <div className="login-panel login-panel-form">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">Sign in to the enrollment portal</p>
          </div>

          {error && (
            <div className="login-alert login-alert-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className={`login-field required ${fieldErrors.email ? 'login-field-error' : ''}`}>
              <label htmlFor="login-email" className="login-label">Email address</label>
              <input
                id="login-email"
                type="email"
                className="login-input"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: '' }));
                }}
                onBlur={() => handleBlur('email')}
                placeholder="you@institute.com"
                autoComplete="email"
                autoFocus
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'login-email-err' : undefined}
              />
              {fieldErrors.email && (
                <span id="login-email-err" className="login-field-message" role="alert">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className={`login-field required ${fieldErrors.password ? 'login-field-error' : ''}`}>
              <label htmlFor="login-password" className="login-label">Password</label>
              <input
                id="login-password"
                type="password"
                className="login-input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: '' }));
                }}
                onBlur={() => handleBlur('password')}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'login-password-err' : undefined}
              />
              {fieldErrors.password && (
                <span id="login-password-err" className="login-field-message" role="alert">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="login-submit-text">
                  <span className="login-spinner" aria-hidden /> Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="login-footer">
            New lead? <Link to="/lead" className="login-link">Submit inquiry form</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
