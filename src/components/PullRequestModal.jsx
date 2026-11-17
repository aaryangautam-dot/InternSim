import { useState } from 'react';
import {
  GitPullRequest, CheckCircle2, XCircle, AlertTriangle,
  FileCode, Send, MessageSquare, ShieldCheck, Clock, ArrowRight, X
} from 'lucide-react';
import { playSound } from '../utils/sound';

export default function PullRequestModal({
  isOpen,
  onClose,
  task,
  starterCode,
  submittedCode,
  review,
  onConfirmSubmit,
  submitting,
  passed,
  xpEarned,
}) {
  const [prTitle, setPrTitle] = useState(`fix(${task?.role || 'core'}): resolve ${task?.title.toLowerCase() || 'issue'}`);
  const [prDescription, setPrDescription] = useState(
    `## Summary of Changes\n- Fixed root cause identified in ${task?.title}\n- Tested across expected input edge cases\n- Verified no breaking changes introduced.`
  );
  const [checklist, setChecklist] = useState({
    rootCause: true,
    edgeCases: true,
    testedLocally: true,
  });

  if (!isOpen) return null;

  // Split both files by line for simple diff visualization
  const starterLines = (starterCode || '').split('\n');
  const submittedLines = (submittedCode || '').split('\n');

  const handleOpenPR = () => {
    playSound.notification();
    onConfirmSubmit({ title: prTitle, description: prDescription });
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 900, width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <GitPullRequest size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Pull Request #1048</h3>
                <span className="badge badge-accent">
                  branch: fix/{task?.id || 'patch'} → main
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                novatech-inc / {task?.role === 'backend' ? 'api-gateway' : task?.role === 'aiml' ? 'data-pipeline' : 'web-client'}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* PR Details Input */}
          {!review && (
            <div className="card" style={{ padding: 18 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  PULL REQUEST TITLE
                </label>
                <input
                  className="input"
                  value={prTitle}
                  onChange={e => setPrTitle(e.target.value)}
                  placeholder="e.g. fix(login): prevent page refresh on mobile Safari"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  DESCRIPTION & REASONING (Explain your approach to your team)
                </label>
                <textarea
                  className="input"
                  rows={4}
                  value={prDescription}
                  onChange={e => setPrDescription(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', resize: 'vertical' }}
                />
              </div>

              {/* Pre-flight checklist */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Pre-flight QA Checklist
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={checklist.rootCause}
                      onChange={e => setChecklist(p => ({ ...p, rootCause: e.target.checked }))}
                    />
                    I identified and isolated the underlying root cause
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={checklist.edgeCases}
                      onChange={e => setChecklist(p => ({ ...p, edgeCases: e.target.checked }))}
                    />
                    I verified defensive checks against null/empty edge cases
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* CI/CD Simulation Pipeline */}
          <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
                NovaTech Automated CI/CD Pipeline
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>GitHub Actions workflow</span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)' }}>
                <CheckCircle2 size={13} /> ESLint & Types: Passed
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)' }}>
                <CheckCircle2 size={13} /> Build bundle: OK (1.08s)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: submitting ? 'var(--warning)' : review?.verdict === 'Pass' ? 'var(--success)' : 'var(--text-tertiary)' }}>
                <Clock size={13} /> Unit Tests: {submitting ? 'Running...' : review ? (review.verdict === 'Pass' ? '4/4 Passed' : '2/4 Failing') : 'Pending PR'}
              </span>
            </div>
          </div>

          {/* Review Results if already submitted */}
          {review && (
            <div className="review-panel" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <div className="review-header" style={{ background: review.verdict === 'Pass' ? 'var(--success-bg)' : 'var(--danger-bg)' }}>
                <div>
                  <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {review.verdict === 'Pass' ? (
                      <><CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> PR Approved & Ready to Merge</>
                    ) : (
                      <><XCircle size={18} style={{ color: 'var(--danger)' }} /> Changes Requested by Lead</>
                    )}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Review Score: {review.score}/10 {passed ? `(+${xpEarned} XP)` : ''}
                  </span>
                </div>
              </div>

              <div className="review-body">
                {review.summary && (
                  <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 12 }}>
                    "{review.summary}"
                  </p>
                )}

                {/* Inline PR Comments */}
                {review.inlineComments?.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <h5 style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                      Line-by-Line Code Review Comments
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {review.inlineComments.map((comment, i) => (
                        <div key={i} style={{
                          padding: '10px 14px',
                          background: 'var(--bg-elevated)',
                          borderRadius: 'var(--radius-md)',
                          borderLeft: '3px solid var(--accent)',
                          fontSize: '0.85rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600 }}>{comment.author} ({comment.role})</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Line {comment.line}</span>
                          </div>
                          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {review.issues?.length > 0 && (
                  <div className="review-section" style={{ marginTop: 14 }}>
                    <h4><XCircle size={14} style={{ color: 'var(--danger)', marginRight: 4 }} /> Issues Flagged</h4>
                    <ul>{review.issues.map((iss, i) => <li key={i}>{iss}</li>)}</ul>
                  </div>
                )}

                {review.strengths?.length > 0 && (
                  <div className="review-section" style={{ marginTop: 14 }}>
                    <h4><CheckCircle2 size={14} style={{ color: 'var(--success)', marginRight: 4 }} /> Strengths</h4>
                    <ul>{review.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Git Diff View */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '10px 16px', background: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem'
            }}>
              <FileCode size={14} />
              <span>Git Diff: <strong>solution.jsx</strong></span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                Comparing branch with master
              </span>
            </div>
            
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
              maxHeight: 280, overflowY: 'auto', background: '#0a0a0a', padding: '12px'
            }}>
              {submittedLines.slice(0, 35).map((line, idx) => {
                const isDifferent = line !== starterLines[idx];
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      background: isDifferent ? 'rgba(34, 197, 94, 0.12)' : 'transparent',
                      color: isDifferent ? '#4ade80' : '#888',
                      padding: '1px 4px',
                    }}
                  >
                    <span style={{ width: 36, color: '#444', userSelect: 'none' }}>{idx + 1}</span>
                    <span style={{ width: 20, userSelect: 'none', color: isDifferent ? '#22c55e' : 'transparent' }}>
                      {isDifferent ? '+' : ' '}
                    </span>
                    <span style={{ whiteSpace: 'pre' }}>{line}</span>
                  </div>
                );
              })}
              {submittedLines.length > 35 && (
                <div style={{ color: '#555', fontStyle: 'italic', padding: '4px 36px' }}>
                  ... ({submittedLines.length - 35} more lines)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
        }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            {review ? 'Close Window' : 'Cancel & Back to Code'}
          </button>

          {!review ? (
            <button
              className="btn btn-primary"
              disabled={submitting}
              onClick={handleOpenPR}
              style={{ gap: 8 }}
            >
              {submitting ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  Submitting to Lead Engineer...
                </>
              ) : (
                <>
                  <GitPullRequest size={16} />
                  Open Pull Request & Request Review
                </>
              )}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onClose} style={{ gap: 8 }}>
              Continue <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
