import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import {
  Award, CheckCircle2, Clock, TrendingUp,
  AlertTriangle, Star, Zap, Trophy
} from 'lucide-react';

export default function Progress() {
  const { user, RANKS } = useUser();
  const { taskStates, TASKS, getCompletedCount, getAverageRating } = useTasks();

  const completedCount = getCompletedCount();
  const avgRating = getAverageRating();
  const totalTime = Object.values(taskStates)
    .filter(s => s.timeTaken > 0)
    .reduce((sum, s) => sum + s.timeTaken, 0);

  const currentRankIndex = RANKS.findIndex(r => r.name === user.rank);
  const nextRank = RANKS[currentRankIndex + 1];
  const xpForNext = nextRank ? nextRank.minXp - user.xp : 0;

  const skills = [
    { name: 'Debugging', score: Math.min(100, completedCount * 25) },
    { name: 'Code Quality', score: Math.min(100, avgRating * 10) },
    { name: 'Speed', score: Math.min(100, completedCount > 0 ? Math.max(20, 100 - (totalTime / completedCount) * 2) : 0) },
    { name: 'Communication', score: Math.min(100, 30 + user.streak * 10) },
    { name: 'Problem Solving', score: Math.min(100, completedCount * 20 + avgRating * 5) },
  ];

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ marginBottom: 4 }}>Your Progress</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Track your internship journey and skill development.</p>
      </div>

      {/* Rank Progression */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>🏆 Rank Progression</h3>
        <div className="rank-progression" style={{ justifyContent: 'center' }}>
          {RANKS.map((rank, i) => {
            const isActive = rank.name === user.rank;
            const isCompleted = user.xp >= rank.minXp && !isActive;
            const isPast = RANKS.findIndex(r => r.name === user.rank) > i;

            return (
              <div key={rank.name} style={{ display: 'contents' }}>
                {i > 0 && (
                  <div className={`rank-connector ${isPast || isActive ? 'filled' : ''}`} />
                )}
                <div className={`rank-node ${isActive ? 'active' : isPast ? 'completed' : ''}`}>
                  <div className="rank-circle">
                    {isPast ? (
                      <CheckCircle2 size={24} />
                    ) : isActive ? (
                      <Zap size={24} />
                    ) : (
                      <Trophy size={20} style={{ opacity: 0.3 }} />
                    )}
                  </div>
                  <span className="rank-label">{rank.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    {rank.minXp} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {nextRank && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <div className="progress-bar" style={{ maxWidth: 400, margin: '0 auto 8px' }}>
              <div className="fill" style={{
                width: `${((user.xp - (RANKS[currentRankIndex]?.minXp || 0)) / (nextRank.minXp - (RANKS[currentRankIndex]?.minXp || 0))) * 100}%`
              }} />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {xpForNext} XP to <strong>{nextRank.name}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card stat-card">
          <div className="stat-icon green"><CheckCircle2 size={22} /></div>
          <div className="stat-info">
            <h4>{completedCount}</h4>
            <p>Tasks Completed</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon orange"><Star size={22} /></div>
          <div className="stat-info">
            <h4>{avgRating}/10</h4>
            <p>Avg. Rating</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon blue"><Clock size={22} /></div>
          <div className="stat-info">
            <h4>{totalTime}m</h4>
            <p>Total Time</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon yellow"><Zap size={22} /></div>
          <div className="stat-info">
            <h4>{user.xp}</h4>
            <p>Total XP</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon red"><AlertTriangle size={22} /></div>
          <div className="stat-info">
            <h4>{user.warnings}/3</h4>
            <p>Warnings</p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>📊 Skill Assessment</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {skills.map(skill => (
            <div key={skill.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 500 }}>{skill.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{Math.round(skill.score)}%</span>
              </div>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${skill.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task History */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>📋 Task History</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TASKS.map(task => {
            const state = taskStates[task.id] || {};
            if (!state.completedAt && state.status !== 'needs-revision') return null;

            return (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
              }}>
                {state.status === 'completed' ? (
                  <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                ) : (
                  <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{task.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    {state.timeTaken}min · {state.numberOfAttempts} attempt(s) · Score: {state.rating}/10
                    {state.isLate && ' · ⚠ Late'}
                  </div>
                </div>
                <span className={`badge ${state.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                  {state.xpEarned > 0 ? `+${state.xpEarned} XP` : state.status === 'needs-revision' ? 'Revise' : '0 XP'}
                </span>
              </div>
            );
          })}
          {completedCount === 0 && (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 20 }}>
              No tasks completed yet. Start working to see your history!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
