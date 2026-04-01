import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import { getDailyBriefing } from '../services/ai';
import {
  CheckCircle2, Clock, TrendingUp, Flame, AlertTriangle,
  ArrowRight, MessageSquare, Play, X, Zap
} from 'lucide-react';

export default function Dashboard() {
  const { user, markBriefingSeen, recordActivity } = useUser();
  const { taskStates, getCompletedCount, getFailedCount, getAverageRating, getActiveTask, TASKS } = useTasks();
  const navigate = useNavigate();
  const [showBriefing, setShowBriefing] = useState(false);
  const [briefingText, setBriefingText] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [showStandup, setShowStandup] = useState(false);
  const [standupAnswers, setStandupAnswers] = useState({ yesterday: '', today: '', blockers: '' });

  useEffect(() => {
    recordActivity();
    if (!user.hasSeenBriefing) {
      setShowBriefing(true);
      loadBriefing();
    }
  }, []);

  const loadBriefing = async () => {
    setBriefingLoading(true);
    const apiKey = localStorage.getItem('internsim-apikey') || '';
    const text = await getDailyBriefing(user.name, apiKey);
    setBriefingText(text);
    setBriefingLoading(false);
  };

  const dismissBriefing = () => {
    setShowBriefing(false);
    markBriefingSeen();
  };

  const activeTask = getActiveTask();
  const completedCount = getCompletedCount();
  const failedCount = getFailedCount();
  const avgRating = getAverageRating();

  const difficultyColors = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-danger' };
  const statusLabels = {
    'available': 'Available',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'needs-revision': 'Needs Revision',
    'locked': 'Locked',
  };

  return (
    <div className="animate-in">
      {/* Briefing Modal */}
      {showBriefing && (
        <div className="modal-overlay" onClick={dismissBriefing}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-gradient)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700
                }}>PS</div>
                <div>
                  <div style={{ fontWeight: 600 }}>Priya Sharma</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Engineering Manager</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={dismissBriefing}><X size={18} /></button>
            </div>
            <h3 style={{ marginBottom: 12 }}>📋 Session Briefing</h3>
            {briefingLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                <div className="spinner" />
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' }}>
                {briefingText}
              </p>
            )}
            <button className="btn btn-primary" onClick={dismissBriefing} style={{ marginTop: 20, width: '100%' }}>
              Got it, let's start
            </button>
          </div>
        </div>
      )}

      {/* Warning Banner */}
      {user.warnings > 0 && (
        <div className="warning-banner">
          <AlertTriangle size={20} className="warning-icon" />
          <div>
            <strong>Performance Warning ({user.warnings}/3)</strong>
            <div style={{ fontSize: '0.82rem', marginTop: 2 }}>
              {user.warnings >= 2
                ? 'Critical: One more failed task will trigger a performance review.'
                : 'Your recent work needs improvement. Focus on code quality.'}
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="card card-accent" style={{ marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -30, right: -30, width: 140, height: 140,
          background: 'var(--accent-muted)', borderRadius: '50%', opacity: 0.5
        }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ marginBottom: 4 }}>Welcome back, {user.name?.split(' ')[0] || 'Intern'} 👋</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            <span className="badge badge-accent" style={{ marginRight: 8 }}>{user.rank}</span>
            NovaTech Engineering · Sprint 3
          </p>
          {activeTask ? (
            <button className="btn btn-primary" onClick={() => navigate(`/task/${activeTask.id}`)}>
              <Play size={16} /> Continue Working — {activeTask.title}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/tasks')}>
              View Tasks <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card stat-card">
          <div className="stat-icon green"><CheckCircle2 size={22} /></div>
          <div className="stat-info">
            <h4>{completedCount}/{TASKS.length}</h4>
            <p>Tasks Completed</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon orange"><TrendingUp size={22} /></div>
          <div className="stat-info">
            <h4>{avgRating || '—'}/10</h4>
            <p>Avg. Rating</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon yellow"><Flame size={22} /></div>
          <div className="stat-info">
            <h4>{user.streak}</h4>
            <p>Day Streak</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon blue"><Zap size={22} /></div>
          <div className="stat-info">
            <h4>{user.xp}</h4>
            <p>Total XP</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Task List */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3>Your Tasks</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>View All</button>
          </div>
          <div>
            {TASKS.map(task => {
              const state = taskStates[task.id] || {};
              return (
                <div
                  key={task.id}
                  className="task-card card"
                  style={{ border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, cursor: state.status === 'locked' ? 'not-allowed' : 'pointer' }}
                  onClick={() => state.status !== 'locked' && navigate(`/task/${task.id}`)}
                >
                  <div className={`task-status-dot ${state.status || 'locked'}`} />
                  <div className="task-info">
                    <div className="task-title" style={{ opacity: state.status === 'locked' ? 0.4 : 1 }}>
                      {task.title}
                    </div>
                    <div className="task-meta">
                      <span className={`badge ${difficultyColors[task.difficulty]}`}>{task.difficulty}</span>
                      <span><Clock size={12} /> {task.estimatedTime}</span>
                      <span className="badge badge-neutral">{statusLabels[state.status] || 'Locked'}</span>
                    </div>
                  </div>
                  {state.status === 'needs-revision' && (
                    <span className="deadline-badge urgent">
                      <AlertTriangle size={14} /> Revision needed
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Daily Standup */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3>🗓️ Daily Standup</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowStandup(!showStandup)}>
                {showStandup ? 'Close' : 'Start'}
              </button>
            </div>
            {showStandup ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="input-group">
                  <label>What did you do yesterday?</label>
                  <input className="input" value={standupAnswers.yesterday} onChange={e => setStandupAnswers(p => ({ ...p, yesterday: e.target.value }))} placeholder="e.g. Worked on login form bug fix" />
                </div>
                <div className="input-group">
                  <label>What are you working on today?</label>
                  <input className="input" value={standupAnswers.today} onChange={e => setStandupAnswers(p => ({ ...p, today: e.target.value }))} placeholder="e.g. Adding dark mode toggle" />
                </div>
                <div className="input-group">
                  <label>Any blockers?</label>
                  <input className="input" value={standupAnswers.blockers} onChange={e => setStandupAnswers(p => ({ ...p, blockers: e.target.value }))} placeholder="e.g. Waiting on design specs" />
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => { setShowStandup(false); navigate('/chat'); }}>
                  Submit to Manager
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Share your daily update with your manager. This is how real teams stay aligned.
              </p>
            )}
          </div>

          {/* Recent Messages */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3>💬 Manager Messages</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/chat')}>
                <MessageSquare size={14} /> Open Chat
              </button>
            </div>
            <div className="chat-bubble manager" style={{ maxWidth: '100%', fontSize: '0.85rem' }}>
              <div className="bubble-header">
                <div className="bubble-avatar">PS</div>
                Priya Sharma
              </div>
              {activeTask
                ? `How's the "${activeTask.title}" task going? I need an update.`
                : completedCount > 0
                  ? 'Good progress so far. Check your next available task when you\'re ready.'
                  : 'Welcome aboard. Check the task board and start with the first item. Let me know if you have questions.'}
            </div>
          </div>

          {/* XP Progress */}
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>🎯 Rank Progression</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
              <span>{user.rank}</span>
              <span>{user.xp} / {user.rank === 'Intern' ? 500 : user.rank === 'Junior Developer' ? 1500 : '∞'} XP</span>
            </div>
            <div className="progress-bar">
              <div className="fill" style={{
                width: `${user.rank === 'Intern' ? (user.xp / 500 * 100) : user.rank === 'Junior Developer' ? ((user.xp - 500) / 1000 * 100) : 100}%`
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
