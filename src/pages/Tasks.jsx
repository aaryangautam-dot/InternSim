import { useNavigate } from 'react-router-dom';
import { useTasks } from '../contexts/TaskContext';
import { Clock, AlertTriangle, ChevronRight, Lock, CheckCircle2, RotateCcw } from 'lucide-react';

export default function Tasks() {
  const { taskStates, TASKS } = useTasks();
  const navigate = useNavigate();

  const difficultyColors = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-danger' };
  const impactColors = { low: 'badge-neutral', medium: 'badge-info', high: 'badge-danger' };

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 4 }}>Task Board</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Complete tasks assigned by your manager. They unlock sequentially.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TASKS.map((task, index) => {
          const state = taskStates[task.id] || {};
          const isLocked = state.status === 'locked';
          const isCompleted = state.status === 'completed';
          const needsRevision = state.status === 'needs-revision';
          const isActive = state.status === 'in-progress';

          return (
            <div
              key={task.id}
              className={`card task-card ${isLocked ? '' : 'card-glass'}`}
              style={{
                opacity: isLocked ? 0.45 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                borderColor: isActive ? 'var(--accent)' : needsRevision ? 'var(--danger)' : undefined,
              }}
              onClick={() => !isLocked && navigate(`/task/${task.id}`)}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isCompleted ? 'var(--success-bg)' : isActive ? 'var(--accent-muted)' : needsRevision ? 'var(--danger-bg)' : 'var(--bg-elevated)',
                color: isCompleted ? 'var(--success)' : isActive ? 'var(--accent)' : needsRevision ? 'var(--danger)' : 'var(--text-tertiary)',
                fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
              }}>
                {isLocked ? <Lock size={18} /> : isCompleted ? <CheckCircle2 size={18} /> : needsRevision ? <RotateCcw size={18} /> : `#${index + 1}`}
              </div>

              <div className="task-info">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  <span className={`badge ${difficultyColors[task.difficulty]}`}>{task.difficulty}</span>
                  <span className={`badge ${impactColors[task.impact]}`}>Impact: {task.impact}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {task.estimatedTime}
                  </span>
                  <span className="deadline-badge normal">
                    ⏰ {task.deadlineMinutes}min deadline
                  </span>
                </div>
              </div>

              <div className="task-actions">
                {isCompleted && state.rating && (
                  <span className={`badge ${state.rating >= 7 ? 'badge-success' : state.rating >= 5 ? 'badge-warning' : 'badge-danger'}`}>
                    {state.rating}/10
                  </span>
                )}
                {needsRevision && (
                  <span className="badge badge-danger">
                    <AlertTriangle size={12} /> Revise
                  </span>
                )}
                {!isLocked && !isCompleted && <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
