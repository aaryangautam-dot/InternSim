import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import { getManagerForRole } from '../data/managers';
import { reviewCode, sendChatMessage } from '../services/ai';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { playSound } from '../utils/sound';
import PullRequestModal from '../components/PullRequestModal';
import {
  ArrowLeft, Clock, AlertTriangle, CheckCircle2,
  XCircle, RotateCcw, FileCode, Mic, MicOff, X, GitPullRequest
} from 'lucide-react';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, addXp, addWarning, updateUser } = useUser();
  const { getTaskState, startTask, updateCode, submitTask, retryTask, TASKS } = useTasks();
  const manager = getManagerForRole(user?.role);

  const task = TASKS.find(t => t.id === id);
  const taskState = getTaskState(id);
  const [code, setCode] = useState(taskState?.code || task?.starterCode || '');
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState(taskState?.feedback || null);
  const [elapsed, setElapsed] = useState(0);
  const [showPRModal, setShowPRModal] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const timerRef = useRef(null);

  // Voice chat for talking to manager while coding
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [voiceChatMessages, setVoiceChatMessages] = useState([]);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const {
    isListening, transcript, voiceSupported,
    toggleListening, speak, setTranscript,
  } = useVoiceChat(manager.voiceConfig);

  useEffect(() => {
    if (task && taskState?.status === 'available') {
      startTask(id);
    }
  }, [id, task, taskState?.status]);

  useEffect(() => {
    if (taskState?.status === 'in-progress' && taskState?.startedAt) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(taskState.startedAt).getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [taskState?.status, taskState?.startedAt]);

  const handleVoiceMessage = async (text) => {
    if (!text || voiceLoading) return;
    const userMsg = { role: 'user', content: text };
    setVoiceChatMessages(prev => [...prev, userMsg]);
    setVoiceLoading(true);
    const apiKey = localStorage.getItem('internsim-apikey') || '';
    const ctx = [
      { role: 'system', content: `The intern is coding task "${task.title}". They are asking a quick question while working.` },
      ...voiceChatMessages.slice(-4).map(m => ({ role: m.role === 'manager' ? 'assistant' : 'user', content: m.content })),
      { role: 'user', content: text },
    ];
    try {
      const response = await sendChatMessage(ctx, apiKey, manager);
      setVoiceChatMessages(prev => [...prev, { role: 'manager', content: response }]);
      speak(response);
    } catch {
      setVoiceChatMessages(prev => [...prev, { role: 'manager', content: "Can't talk right now." }]);
    } finally {
      setVoiceLoading(false);
    }
  };

  // Auto-send voice transcript
  useEffect(() => {
    if (!isListening && transcript && showVoicePanel) {
      handleVoiceMessage(transcript);
      setTranscript('');
    }
  }, [isListening, transcript, showVoicePanel]);

  if (!task) {
    return (
      <div className="empty-state">
        <h3>Task not found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/tasks')}>Back to Tasks</button>
      </div>
    );
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const deadlineSeconds = task.deadlineMinutes * 60;
  const isOverDeadline = elapsed > deadlineSeconds;
  const deadlineProgress = Math.min((elapsed / deadlineSeconds) * 100, 100);

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    const apiKey = localStorage.getItem('internsim-apikey') || '';
    try {
      const feedback = await reviewCode(
        `Task: ${task.title}\n\nContext: ${task.context}\n\nExpected: ${task.expectedBehavior}`,
        code,
        task.starterCode,
        apiKey,
        manager,
        task.id
      );
      setReview(feedback);
      const result = submitTask(id, code, feedback);
      setLastResult(result);

      if (result.passed) {
        playSound.success();
        addXp(result.xpEarned);
        updateUser({
          totalTasksCompleted: (user?.totalTasksCompleted || 0) + 1,
          totalTimeTaken: (user?.totalTimeTaken || 0) + result.timeTaken
        });
      } else {
        playSound.alert();
        const state = getTaskState(id);
        if (state.numberOfAttempts >= 2) addWarning();
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
    setLastResult(null);
  };

  const handleCodeChange = (v) => {
    setCode(v || '');
    updateCode(id, v || '');
  };

  const isCompleted = taskState?.status === 'completed';
  const needsRevision = taskState?.status === 'needs-revision';
  const editorLang = task.role === 'aiml' ? 'python' : 'javascript';
  const fileName = task.role === 'aiml' ? 'pipeline.py' : task.role === 'backend' ? 'routes/api.js' : 'components/solution.jsx';

  return (
    <div className="editor-layout">
      {/* Pull Request Modal */}
      <PullRequestModal
        isOpen={showPRModal}
        onClose={() => setShowPRModal(false)}
        task={task}
        starterCode={task.starterCode}
        submittedCode={code}
        review={review}
        onConfirmSubmit={handleConfirmSubmit}
        submitting={submitting}
        passed={lastResult?.passed}
        xpEarned={lastResult?.xpEarned}
      />

      {/* Instructions Panel */}
      <div className="editor-instructions">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')} style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back to Sprint Board
        </button>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${task.difficulty === 'easy' ? 'badge-success' : task.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'}`}>
              {task.difficulty}
            </span>
            <span className={`badge ${task.impact === 'high' ? 'badge-danger' : 'badge-info'}`}>
              Impact: {task.impact}
            </span>
            <span className="badge badge-accent">
              ticket: #{task.id}
            </span>
          </div>
          <h2 style={{ marginBottom: 8 }}>{task.title}</h2>
        </div>

        {/* Deadline Timer */}
        <div className="card" style={{ marginBottom: 16, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
              <Clock size={16} /> Sprint Time Elapsed
            </span>
            <span className={`deadline-badge ${isOverDeadline ? 'urgent' : deadlineProgress > 75 ? 'warning' : 'normal'}`}>
              {formatTime(elapsed)} / {task.deadlineMinutes}:00
            </span>
          </div>
          <div className="progress-bar">
            <div className="fill" style={{ width: `${deadlineProgress}%`, background: isOverDeadline ? 'var(--danger)' : deadlineProgress > 75 ? 'var(--warning)' : undefined }} />
          </div>
          {isOverDeadline && (
            <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 6 }}>
              ⚠ Past sprint target. Late penalty applies to velocity XP.
            </p>
          )}
        </div>

        {/* Manager Ticket Description */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 'var(--radius-full)',
              background: manager.avatarColor, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.65rem'
            }}>
              {manager.initials}
            </div>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{manager.name}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginLeft: 8 }}>{manager.title}</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {task.context}
          </p>
        </div>

        {/* Deliverables Checklist */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: '0.85rem', marginBottom: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            PR Acceptance Criteria
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {task.deliverables.map((d, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--accent)', marginTop: 2 }}>▸</span>{d}
              </li>
            ))}
          </ul>
        </div>

        <details className="card" style={{ marginBottom: 16 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
            💡 Senior Dev Hints
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
                  {review.verdict === 'Pass' ? '✅ Approved' : '🔄 Changes Requested'} — {manager.name}
                </span>
              </div>
              <div className="review-score">
                <div className="score-circle" style={{ background: review.score >= 7 ? 'var(--success)' : review.score >= 5 ? 'var(--warning)' : 'var(--danger)' }}>
                  {review.score}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/10</span>
              </div>
            </div>
            <div className="review-body">
              {review.summary && (
                <div className="review-section">
                  <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>"{review.summary}"</p>
                </div>
              )}
              {review.issues?.length > 0 && (
                <div className="review-section">
                  <h4><XCircle size={14} style={{ color: 'var(--danger)', marginRight: 4 }} /> Issues Found</h4>
                  <ul>{review.issues.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </div>
              )}
              {review.improvements?.length > 0 && (
                <div className="review-section">
                  <h4><AlertTriangle size={14} style={{ color: 'var(--warning)', marginRight: 4 }} /> Suggested Improvements</h4>
                  <ul>{review.improvements.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </div>
              )}
              {review.strengths?.length > 0 && (
                <div className="review-section">
                  <h4><CheckCircle2 size={14} style={{ color: 'var(--success)', marginRight: 4 }} /> What Was Done Well</h4>
                  <ul>{review.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </div>
              )}
            </div>
            {needsRevision && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-primary" onClick={handleRetry} style={{ width: '100%' }}>
                  <RotateCcw size={16} /> Revise & Push Update
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
            <FileCode size={14} /> {fileName}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Voice talk to manager button */}
            {voiceSupported && !isCompleted && (
              <button
                className={`btn btn-sm ${showVoicePanel ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowVoicePanel(!showVoicePanel)}
                title="Talk to manager while coding"
              >
                {showVoicePanel ? <MicOff size={14} /> : <Mic size={14} />}
                {showVoicePanel ? ' Close' : ' Ask Manager'}
              </button>
            )}

            {(isCompleted || needsRevision) ? (
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tasks')}>
                Back to Sprint Board
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowPRModal(true)}
                style={{ gap: 6 }}
              >
                <GitPullRequest size={14} /> Create Pull Request
              </button>
            )}
          </div>
        </div>

        {/* Floating voice panel */}
        {showVoicePanel && (
          <div style={{
            position: 'absolute', top: 52, right: 16, width: 340, zIndex: 50,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden', animation: 'fadeInUp 0.2s ease',
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: 'var(--radius-full)', background: manager.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.55rem', fontWeight: 700 }}>
                  {manager.initials}
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>Quick Chat — {manager.name.split(' ')[0]}</span>
              </div>
              <button className="btn btn-ghost btn-icon" style={{ width: 24, height: 24 }} onClick={() => setShowVoicePanel(false)}>
                <X size={14} />
              </button>
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {voiceChatMessages.length === 0 && (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textAlign: 'center', padding: 16 }}>
                  Tap mic and ask {manager.name.split(' ')[0]} a question
                </p>
              )}
              {voiceChatMessages.map((m, i) => (
                <div key={i} style={{
                  padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem',
                  background: m.role === 'manager' ? 'var(--bg-elevated)' : 'var(--accent-muted)',
                  alignSelf: m.role === 'manager' ? 'flex-start' : 'flex-end', maxWidth: '85%',
                }}>
                  {m.content}
                </div>
              ))}
              {voiceLoading && (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span className="spinner" style={{ width: 12, height: 12 }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>thinking...</span>
                </div>
              )}
              {isListening && transcript && (
                <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', background: 'var(--accent-muted)', alignSelf: 'flex-end', opacity: 0.6, fontStyle: 'italic' }}>
                  {transcript}...
                </div>
              )}
            </div>
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
              <button
                className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
                onClick={toggleListening}
                disabled={voiceLoading}
                style={{ width: '100%', gap: 6 }}
              >
                {isListening ? <><span className="voice-pulse" /> Listening... tap to stop</> : <><Mic size={14} /> Tap to speak</>}
              </button>
            </div>
          </div>
        )}

        <div className="editor-wrapper" style={{ position: 'relative' }}>
          <Editor
            height="100%"
            language={editorLang}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={code}
            onChange={handleCodeChange}
            options={{
              fontSize: 14, fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false }, padding: { top: 16 },
              scrollBeyondLastLine: false, wordWrap: 'on', lineNumbers: 'on',
              renderLineHighlight: 'line', bracketPairColorization: { enabled: true },
              readOnly: isCompleted,
            }}
          />
        </div>
      </div>
    </div>
  );
}
