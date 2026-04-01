import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import { reviewCode } from '../services/ai';
import {
  ArrowLeft, Send, Clock, AlertTriangle, CheckCircle2,
  XCircle, RotateCcw, FileCode, Loader
} from 'lucide-react';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, addXp, addWarning, updateUser } = useUser();
  const { getTaskState, startTask, updateCode, submitTask, retryTask, TASKS } = useTasks();

  const task = TASKS.find(t => t.id === id);
  const taskState = getTaskState(id);
  const [code, setCode] = useState(taskState?.code || task?.starterCode || '');
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState(taskState?.feedback || null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (task && taskState?.status === 'available') {
      startTask(id);
    }
  }, [id]);

  // Timer
  useEffect(() => {
    if (taskState?.status === 'in-progress' && taskState?.startedAt) {
      timerRef.current = setInterval(() => {
        const started = new Date(taskState.startedAt).getTime();
        setElapsed(Math.floor((Date.now() - started) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [taskState?.status, taskState?.startedAt]);

  if (!task) {
    return (
      <div className="empty-state">
        <h3>Task not found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/tasks')}>Back to Tasks</button>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const deadlineSeconds = task.deadlineMinutes * 60;
  const isOverDeadline = elapsed > deadlineSeconds;
  const deadlineProgress = Math.min((elapsed / deadlineSeconds) * 100, 100);

  const handleSubmit = async () => {
    setSubmitting(true);
    const apiKey = localStorage.getItem('internsim-apikey') || '';

    try {
      const feedback = await reviewCode(
        `Task: ${task.title}\n\nContext: ${task.context}\n\nExpected: ${task.expectedBehavior}`,
        code,
        task.starterCode,
        apiKey
      );

      setReview(feedback);
      const result = submitTask(id, code, feedback);

      if (result.passed) {
        addXp(result.xpEarned);
        updateUser({
          totalTasksCompleted: user.totalTasksCompleted + 1,
          totalTimeTaken: user.totalTimeTaken + result.timeTaken,
        });
      } else {
        // Check if this triggers a warning
        const state = getTaskState(id);
        if (state.numberOfAttempts >= 2) {
          addWarning();
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
      clearInterval(timerRef.current);
    }
  };

  const handleRetry = () => {
    retryTask(id);
    setCode(task.starterCode);
    setReview(null);
    setElapsed(0);
  };

  const handleCodeChange = (value) => {
    setCode(value || '');
    updateCode(id, value || '');
  };

  const isCompleted = taskState?.status === 'completed';
  const needsRevision = taskState?.status === 'needs-revision';

  return (
    <div className="editor-layout">
      {/* Instructions Panel */}
      <div className="editor-instructions">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')} style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back to Tasks
        </button>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${task.difficulty === 'easy' ? 'badge-success' : task.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'}`}>
              {task.difficulty}
            </span>
            <span className={`badge ${task.impact === 'high' ? 'badge-danger' : 'badge-info'}`}>
              Impact: {task.impact}
            </span>
          </div>
          <h2 style={{ marginBottom: 8 }}>{task.title}</h2>
        </div>

        {/* Deadline Timer */}
        <div className="card" style={{ marginBottom: 16, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
              <Clock size={16} /> Time Elapsed
            </span>
            <span className={`deadline-badge ${isOverDeadline ? 'urgent' : deadlineProgress > 75 ? 'warning' : 'normal'}`}>
              {formatTime(elapsed)} / {task.deadlineMinutes}:00
            </span>
          </div>
          <div className="progress-bar">
            <div className="fill" style={{
              width: `${deadlineProgress}%`,
              background: isOverDeadline
                ? 'var(--danger)'
                : deadlineProgress > 75
                  ? 'var(--warning)'
                  : undefined,
            }} />
          </div>
          {isOverDeadline && (
            <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 6 }}>
              ⚠ You're past the deadline. XP penalty will apply.
            </p>
          )}
        </div>

        {/* Manager Message (task context) */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 'var(--radius-full)',
              background: 'var(--accent-gradient)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'white',
              fontWeight: 700, fontSize: '0.65rem'
            }}>PS</div>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Priya Sharma</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginLeft: 8 }}>Manager</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {task.context}
          </p>
        </div>

        {/* Deliverables */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: '0.85rem', marginBottom: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Deliverables
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {task.deliverables.map((d, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--accent)', marginTop: 2 }}>▸</span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Hints (collapsible) */}
        <details className="card" style={{ marginBottom: 16 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
            💡 Hints (try on your own first)
          </summary>
          <ul style={{ marginTop: 12, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {task.hints.map((h, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
                {h}
              </li>
            ))}
          </ul>
        </details>

        {/* Code Review Results */}
        {review && (
          <div className="review-panel">
            <div className="review-header">
              <div>
                <h4 style={{ margin: 0 }}>Code Review</h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                  {review.verdict === 'Pass' ? '✅ Approved' : '🔄 Changes Requested'}
                </span>
              </div>
              <div className="review-score">
                <div className="score-circle" style={{
                  background: review.score >= 7 ? 'var(--success)' : review.score >= 5 ? 'var(--warning)' : 'var(--danger)',
                }}>
                  {review.score}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/10</span>
              </div>
            </div>
            <div className="review-body">
              {review.summary && (
                <div className="review-section">
                  <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    "{review.summary}"
                  </p>
                </div>
              )}
              {review.issues?.length > 0 && (
                <div className="review-section">
                  <h4><XCircle size={14} style={{ color: 'var(--danger)', marginRight: 4 }} /> Issues Found</h4>
                  <ul>
                    {review.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                  </ul>
                </div>
              )}
              {review.improvements?.length > 0 && (
                <div className="review-section">
                  <h4><AlertTriangle size={14} style={{ color: 'var(--warning)', marginRight: 4 }} /> Suggested Improvements</h4>
                  <ul>
                    {review.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                  </ul>
                </div>
              )}
              {review.strengths?.length > 0 && (
                <div className="review-section">
                  <h4><CheckCircle2 size={14} style={{ color: 'var(--success)', marginRight: 4 }} /> What Was Done Well</h4>
                  <ul>
                    {review.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
            {needsRevision && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-primary" onClick={handleRetry} style={{ width: '100%' }}>
                  <RotateCcw size={16} /> Revise & Resubmit
                </button>
              </div>
            )}
            {isCompleted && taskState?.xpEarned > 0 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                  +{taskState.xpEarned} XP earned {taskState.isLate ? '(late penalty applied)' : ''}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor Panel */}
      <div className="editor-panel">
        <div className="editor-toolbar">
          <div className="file-tab">
            <FileCode size={14} />
            solution.jsx
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(isCompleted || needsRevision) ? (
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tasks')}>
                Back to Tasks
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? <><Loader size={14} className="spin" /> Reviewing...</> : <><Send size={14} /> Submit for Review</>}
              </button>
            )}
          </div>
        </div>

        <div className="editor-wrapper">
          <Editor
            height="100%"
            language="javascript"
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={code}
            onChange={handleCodeChange}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              bracketPairColorization: { enabled: true },
              readOnly: isCompleted,
            }}
          />
        </div>
      </div>
    </div>
  );
}
