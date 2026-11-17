import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Zap, Lock, Mail, User, Monitor, Server, Brain, ArrowRight, AlertCircle } from 'lucide-react';

const ROLES = [
  { id: 'frontend', title: 'Frontend Developer', desc: 'UI bugs, Safari failures, React optimization', icon: Monitor },
  { id: 'backend', title: 'Backend Architect', desc: 'Node APIs, N+1 queries, JWT auth, rate limits', icon: Server },
  { id: 'aiml', title: 'AI/ML Engineer', desc: 'Data leakage, ML pipelines, vanishing gradients', icon: Brain },
];

export default function Signup() {
  const { register } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('frontend');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register({
        name,
        username,
        email,
        password,
        role,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        {/* Brand Logo */}
        <div className="auth-header">
          <div className="auth-logo">
            <Zap size={22} color="#fff" />
          </div>
          <h1>Create Your SaaS Account</h1>
          <p>Join NovaTech Engineering and begin your realistic developer internship</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Username</label>
              <input
                className="input"
                type="text"
                placeholder="e.g. arivera"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Work or Personal Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                className="input"
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password (min. 6 characters)</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                className="input"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role Track Selector */}
          <div className="input-group">
            <label style={{ marginBottom: 8, display: 'block' }}>Choose Engineering Track</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ROLES.map(r => {
                const isSelected = role === r.id;
                const Icon = r.icon;
                return (
                  <div
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--accent)' : 'var(--bg-card)',
                      color: isSelected ? '#fff' : 'var(--text-tertiary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {r.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: 12 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 16, height: 16 }} />
                Setting Up Account...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Create Account & Enter Simulator <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already registered as an engineer?{' '}
          <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}
