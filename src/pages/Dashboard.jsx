import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import { getManagerForRole } from '../data/managers';
import { getDailyBriefing } from '../services/ai';
import { playSound } from '../utils/sound';
import {
  CheckCircle2, Clock, TrendingUp, Flame, AlertTriangle,
  ArrowRight, MessageSquare, Play, X, Zap, Siren
} from 'lucide-react';

export default function Dashboard() {
  const { user, markBriefingSeen, recordActivity } = useUser();
  const { taskStates, getCompletedCount, getAverageRating, getActiveTask, TASKS } = useTasks();
  const manager = getManagerForRole(user?.role);
  const navigate = useNavigate();
  const [showBriefing, setShowBriefing] = useState(() => !user?.hasSeenBriefing);
  const [briefingText, setBriefingText] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(() => !user?.hasSeenBriefing);
  const [showP0Alert, setShowP0Alert] = useState(false);

  useEffect(() => {
    recordActivity();
    if (!user?.hasSeenBriefing) {
      let active = true;
      const apiKey = localStorage.getItem('internsim-apikey') || '';
      getDailyBriefing(user?.name, apiKey, manager).then(text => {
        if (active) {
          setBriefingText(text);
          setBriefingLoading(false);
        }
      }).catch(() => {
        if (active) setBriefingLoading(false);
      });
      return () => { active = false; };
    }
  }, [recordActivity, user?.hasSeenBriefing, user?.name, manager]);

  const dismissBriefing = () => {
    setShowBriefing(false);
    markBriefingSeen();
  };

  const triggerP0Simulation = () => {
    playSound.alert();
    setShowP0Alert(true);
  };

  const activeTask = getActiveTask();
  const completedCount = getCompletedCount();
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
                  background: manager.avatarColor, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700
                }}>
                  {manager.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{manager.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{manager.title}</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={dismissBriefing}><X size={18} /></button>
            </div>
            <h3 style={{ marginBottom: 12 }}>📋 Sprint Standup Briefing</h3>
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
              Got it, let's start the sprint
            </button>
          </div>
        </div>
      )}

      {/* P0 Incident Simulation Alert */}
      {showP0Alert && (
        <div className="card" style={{
          marginBottom: 20, background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--danger)', padding: 18, animation: 'fadeInUp 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ padding: 8, background: 'var(--danger)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                <Siren size={22} />
              </div>
              <div>
                <h4 style={{ color: 'var(--danger)', margin: 0, fontSize: '0.95rem' }}>
                  🚨 SIMULATED P0 INCIDENT: Production Service Degradation
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>
                  PagerDuty alert in <strong>#prod-alerts</strong>: 62% of mobile Safari users are encountering validation crashes on submit. Customer conversions are dropping rapidly.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/task/task-1')}>
                    Jump to Incident Ticket (task-1)
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/chat')}>
                    Check #prod-alerts in Slack
                  </button>
                </div>
              </div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={() => setShowP0Alert(false)}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Warning Banner */}
      {user?.warnings > 0 && (
        <div className="warning-banner" style={{ marginBottom: 20 }}>
          <AlertTriangle size={20} className="warning-icon" />
          <div>
            <strong>Performance Warning ({user?.warnings}/3)</strong>
            <div style={{ fontSize: '0.82rem', marginTop: 2 }}>
              {(user?.warnings || 0) >= 2
                ? 'Critical: One more rejected PR will trigger an engineering performance review.'
                : 'Your recent PR had quality issues. Follow PR acceptance criteria closely.'}
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
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>Welcome back, {user?.name?.split(' ')[0] || 'Intern'} 👋</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              <span className="badge badge-accent" style={{ marginRight: 8 }}>{user?.rank || 'Intern'}</span>
              NovaTech Engineering · Sprint 4 (Active)
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={triggerP0Simulation} title="Simulate a production outage drill">
              <Siren size={14} style={{ color: 'var(--danger)' }} /> Simulate P0 Drill
            </button>
            {activeTask ? (
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/task/${activeTask.id}`)}>
                <Play size={14} /> Resume Active Ticket
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/tasks')}>
                View Sprint Board <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card stat-card">
          <div className="stat-icon green"><CheckCircle2 size={22} /></div>
          <div className="stat-info">
            <h4>{completedCount}/{TASKS.length}</h4>
            <p>PRs Merged</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon orange"><TrendingUp size={22} /></div>
          <div className="stat-info">
            <h4>{avgRating || '—'}/10</h4>
            <p>Code Review Avg</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon yellow"><Flame size={22} /></div>
          <div className="stat-info">
            <h4>{user?.streak || 0}</h4>
            <p>Sprint Streak</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon blue"><Zap size={22} /></div>
          <div className="stat-info">
            <h4>{user?.xp || 0}</h4>
            <p>Velocity XP</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        {/* Ticket List */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Current Sprint Backlog</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>All Tickets</button>
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
                      <AlertTriangle size={14} /> Changes Requested
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Slack & Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Recent Slack Snippet */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>💬 Team Slack (#engineering)</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/chat')}>
                <MessageSquare size={14} /> Open Slack
              </button>
            </div>
            <div className="chat-bubble manager" style={{ maxWidth: '100%', fontSize: '0.85rem' }}>
              <div className="bubble-header">
                <div className="bubble-avatar" style={{ background: manager.avatarColor }}>{manager.initials}</div>
                {manager.name} ({manager.title})
              </div>
              {activeTask
                ? `How is progress on "${activeTask.title}"? Make sure to open a PR as soon as you have a passing test.`
                : completedCount > 0
                  ? 'Good velocity this sprint. Pick up your next backlog ticket when ready.'
                  : 'Welcome to NovaTech. Start with the mobile auth ticket on the backlog. Ping in #engineering if you have blockers.'}
            </div>
          </div>

          {/* XP Progress */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>🎯 Engineering Career Ladder</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
              <span>{user?.rank || 'Intern'}</span>
              <span>{user?.xp || 0} / {user?.rank === 'Intern' ? 500 : user?.rank === 'Junior Developer' ? 1500 : 'Senior'} XP</span>
            </div>
            <div className="progress-bar">
              <div className="fill" style={{
                width: `${user?.rank === 'Intern' ? ((user?.xp || 0) / 500 * 100) : user?.rank === 'Junior Developer' ? (((user?.xp || 0) - 500) / 1000 * 100) : 100}%`
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
