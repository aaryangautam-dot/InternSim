import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Monitor, Server, Brain, ChevronRight, Zap, Sparkles } from 'lucide-react';

const ROLES = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    desc: 'Build user interfaces, fix UI bugs, optimize components',
    icon: Monitor,
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    desc: 'APIs, databases, server-side logic',
    icon: Server,
  },
  {
    id: 'aiml',
    title: 'AI/ML Intern',
    desc: 'Machine learning, data processing',
    icon: Brain,
  },
];

const LEVELS = [
  { id: 'beginner', title: 'Beginner', desc: 'I know the basics of HTML/CSS/JS and some React' },
  { id: 'intermediate', title: 'Intermediate', desc: 'I\'ve built a few projects and understand React patterns' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('');
  const [assigning, setAssigning] = useState(false);
  const { completeOnboarding } = useUser();
  const navigate = useNavigate();

  const handleFinish = () => {
    setAssigning(true);
    setTimeout(() => {
      completeOnboarding(name, role, level);
      navigate('/dashboard');
    }, 2400);
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card card animate-in">
        {/* Step dots */}
        <div className="step-dots">
          {[0, 1, 2].map(i => (
            <div key={i} className={`dot ${step === i ? 'active' : ''}`} />
          ))}
        </div>

        {assigning ? (
          <div style={{ padding: '40px 0' }}>
            <div style={{ marginBottom: 24 }}>
              <Sparkles size={48} style={{ color: 'var(--accent)' }} />
            </div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: 12 }}>Setting up your workspace...</h1>
            <p className="subtitle">Assigning you to NovaTech Engineering Team</p>
            <div className="spinner spinner-lg" style={{ margin: '32px auto' }} />
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              Your manager Priya Sharma will brief you shortly.
            </p>
          </div>
        ) : step === 0 ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <Zap size={40} style={{ color: 'var(--accent)' }} />
            </div>
            <h1>Welcome to <span style={{ color: 'var(--accent)' }}>InternSim</span></h1>
            <p className="subtitle">Your realistic internship experience starts here. What's your name?</p>

            <div className="input-group" style={{ marginBottom: 32, textAlign: 'left' }}>
              <label>Full Name</label>
              <input
                className="input"
                type="text"
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(1)}
              />
            </div>

            <button
              className="btn btn-primary btn-lg"
              disabled={!name.trim()}
              onClick={() => setStep(1)}
              style={{ width: '100%' }}
            >
              Continue <ChevronRight size={18} />
            </button>
          </>
        ) : step === 1 ? (
          <>
            <h1>Choose your role</h1>
            <p className="subtitle">What team are you joining, {name.split(' ')[0]}?</p>

            <div className="role-grid">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  className={`role-option ${role === r.id ? 'selected' : ''}`}
                  onClick={() => setRole(r.id)}
                >
                  <div className="role-icon">
                    <r.icon size={22} />
                  </div>
                  <div className="role-text">
                    <h3>{r.title}</h3>
                    <p>{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary btn-lg"
              disabled={!role}
              onClick={() => setStep(2)}
              style={{ width: '100%' }}
            >
              Continue <ChevronRight size={18} />
            </button>
          </>
        ) : (
          <>
            <h1>Your experience level</h1>
            <p className="subtitle">This helps us calibrate task difficulty.</p>

            <div className="role-grid">
              {LEVELS.map(l => (
                <button
                  key={l.id}
                  className={`role-option ${level === l.id ? 'selected' : ''}`}
                  onClick={() => setLevel(l.id)}
                >
                  <div className="role-text" style={{ paddingLeft: 8 }}>
                    <h3>{l.title}</h3>
                    <p>{l.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary btn-lg"
              disabled={!level}
              onClick={handleFinish}
              style={{ width: '100%' }}
            >
              Start Internship <Sparkles size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
