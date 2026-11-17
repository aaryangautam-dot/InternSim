import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Zap, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login } = useUser();
  const navigate = useNavigate();

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identity.trim() || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(identity, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setIdentity('intern@novatech.io');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Brand Logo */}
        <div className="auth-header">
          <div className="auth-logo">
            <Zap size={22} color="#fff" />
          </div>
          <h1>Sign in to NovaTech</h1>
          <p>Access your engineering simulator workspace & sprint tickets</p>
        </div>

        {/* Demo Quick Fill Pill */}
        <button
          type="button"
          onClick={fillDemoAccount}
          className="auth-demo-badge"
          title="Click to auto-fill demo credentials"
        >
          <ShieldCheck size={14} />
          <span>Demo Account: <strong>intern@novatech.io</strong> / <strong>password123</strong></span>
        </button>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email or Username</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                className="input"
                type="text"
                placeholder="name@company.com or username"
                value={identity}
                onChange={e => setIdentity(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', cursor: 'pointer' }} onClick={() => alert('Demo password is: password123')}>
                Forgot password?
              </span>
            </div>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 16, height: 16 }} />
                Authenticating...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Sign In <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an engineering account?{' '}
          <Link to="/signup">Create one now</Link>
        </div>
      </div>
    </div>
  );
}
