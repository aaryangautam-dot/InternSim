import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import { getManagerForRole } from '../data/managers';
import { COMPANIES } from '../data/companies';
import OfferLetterModal from '../components/OfferLetterModal';
import {
  CheckCircle2, Clock,
  AlertTriangle, Star, Zap, Trophy, Copy, Check,
  Building2, FileSignature, Lock, Award
} from 'lucide-react';

export default function Progress() {
  const { user, RANKS = [], signOfferLetter } = useUser();
  const { taskStates, TASKS, getCompletedCount, getAverageRating } = useTasks();
  const manager = getManagerForRole(user?.role);
  const [copiedBullet, setCopiedBullet] = useState(null);
  const [selectedOfferCompany, setSelectedOfferCompany] = useState(null);

  const completedCount = getCompletedCount();
  const avgRating = getAverageRating();
  const totalTime = Object.values(taskStates)
    .filter(s => s.timeTaken > 0)
    .reduce((sum, s) => sum + s.timeTaken, 0);

  const currentRankIndex = RANKS.findIndex(r => r.name === user?.rank);
  const nextRank = RANKS[currentRankIndex + 1];
  const xpForNext = nextRank ? nextRank.minXp - (user?.xp || 0) : 0;

  const skills = [
    { name: 'Root Cause Debugging', score: Math.min(100, completedCount * 25) },
    { name: 'Code Quality & Clean Architecture', score: Math.min(100, avgRating * 10) },
    { name: 'Sprint Velocity & Efficiency', score: Math.min(100, completedCount > 0 ? Math.max(20, 100 - (totalTime / completedCount) * 2) : 0) },
    { name: 'PR Etiquette & Technical Communication', score: Math.min(100, 30 + (user?.streak || 0) * 10) },
    { name: 'Edge Case Defensive Coding', score: Math.min(100, completedCount * 20 + avgRating * 5) },
  ];

  // Generate ATS resume bullets based on completed tickets
  const resumeBullets = TASKS.filter(t => taskStates[t.id]?.status === 'completed').map(t => {
    if (t.id === 'task-1') {
      return "Refactored high-traffic authentication form for mobile Safari, eliminating page-refresh defects and implementing robust input validation regex.";
    }
    if (t.id === 'task-2') {
      return "Architected centralized theme state management in React using custom Context API, ensuring seamless CSS variable switching and persistent user preferences.";
    }
    if (t.id === 'task-3') {
      return "Diagnosed and resolved critical e-commerce cart event-handler bug, fixing immediate callback invocations and implementing auto-dismissing visual toasts.";
    }
    if (t.id === 'task-4') {
      return "Decomposed monolithic 150-line legacy component into modular, reusable functional sub-components, reducing maintenance overhead and technical debt.";
    }
    if (t.id === 'task-5') {
      return "Optimized component re-render performance across 500+ items using useMemo, useCallback, and debounced search, boosting page responsiveness.";
    }
    return `Resolved ${t.title} within production codebase, ensuring complete test coverage and peer code review approval.`;
  });

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(idx);
    setTimeout(() => setCopiedBullet(null), 1800);
  };

  return (
    <div className="animate-in">
      {/* Offer Letter Viewer Modal */}
      {selectedOfferCompany && (
        <OfferLetterModal
          isOpen={!!selectedOfferCompany}
          onClose={() => setSelectedOfferCompany(null)}
          company={selectedOfferCompany}
          userName={user?.name || 'Engineer'}
          alreadySigned={user?.signedOfferLetters?.includes(selectedOfferCompany.id)}
          onAcceptOffer={(cid) => signOfferLetter(cid)}
        />
      )}

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ marginBottom: 4 }}>Engineering Career Dossier</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Verifiable proof of work, company promotions, and ATS credentials.
        </p>
      </div>

      {/* Verified Employment Timeline */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} style={{ color: 'var(--accent)' }} /> Verified Work Experience Timeline
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '4px 0 0' }}>
              Your ladder of verified employment offers across tech tiers.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {COMPANIES.map((company, idx) => {
            const isUnlocked = user?.unlockedCompanies?.includes(company.id);
            const isSigned = user?.signedOfferLetters?.includes(company.id);

            return (
              <div
                key={company.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  background: isSigned ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                  border: isSigned ? `1px solid ${company.accentColor}66` : '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 'var(--radius-md)',
                    background: company.gradient, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem'
                  }}>
                    {isSigned ? <CheckCircle2 size={22} /> : isUnlocked ? <FileSignature size={20} /> : <Lock size={18} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{company.brandName}</span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                        Tier {company.tier} · {company.stage}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {company.offerDetails.roleTitle} · {company.stipend}
                    </div>
                  </div>
                </div>

                <div>
                  {isSigned ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedOfferCompany(company)}
                      style={{ gap: 6 }}
                    >
                      <Award size={14} style={{ color: company.accentColor }} /> View Signed Offer Letter
                    </button>
                  ) : isUnlocked ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedOfferCompany(company)}
                      style={{ background: company.gradient, border: 'none', gap: 6 }}
                    >
                      <FileSignature size={14} /> Review & Sign Offer
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={12} /> Clear Tier {idx} to Unlock
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rank Progression */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>🏆 Engineering Title Progression</h3>
        <div className="rank-progression" style={{ justifyContent: 'center' }}>
          {RANKS.map((rank, i) => {
            const isActive = rank.name === user?.rank;
            const isPast = RANKS.findIndex(r => r.name === user?.rank) > i;

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
                width: `${(((user?.xp || 0) - (RANKS[currentRankIndex]?.minXp || 0)) / (nextRank.minXp - (RANKS[currentRankIndex]?.minXp || 0))) * 100}%`
              }} />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {xpForNext} XP until promotion to <strong>{nextRank.name}</strong>
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
            <p>PRs Merged</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon orange"><Star size={22} /></div>
          <div className="stat-info">
            <h4>{avgRating}/10</h4>
            <p>Review Score</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon blue"><Clock size={22} /></div>
          <div className="stat-info">
            <h4>{totalTime}m</h4>
            <p>Sprint Time</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon yellow"><Zap size={22} /></div>
          <div className="stat-info">
            <h4>{user?.xp || 0}</h4>
            <p>Total XP</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon red"><AlertTriangle size={22} /></div>
          <div className="stat-info">
            <h4>{user?.warnings || 0}/3</h4>
            <p>Warnings</p>
          </div>
        </div>
      </div>

      {/* ATS Resume Bullets Section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>📄 ATS-Optimized Resume Bullets</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '4px 0 0' }}>
              Action-oriented bullet points tailored for your resume and LinkedIn based on real PRs merged.
            </p>
          </div>
        </div>

        {resumeBullets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {resumeBullets.map((bullet, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px', background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center', gap: 12
                }}
              >
                <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                  • {bullet}
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(bullet, idx)}
                  style={{ flexShrink: 0, gap: 4 }}
                >
                  {copiedBullet === idx ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', padding: '16px 0', margin: 0 }}>
            Complete and merge your first Pull Request to unlock verified resume bullet points.
          </p>
        )}
      </div>

      {/* Manager Endorsement Letter */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14, fontSize: '1.05rem' }}>✍️ Lead Engineer Reference & Feedback</h3>
        <div style={{ padding: '16px 20px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: manager.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.65rem' }}>
              {manager.initials}
            </div>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{manager.name}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginLeft: 8 }}>{manager.title}</span>
            </div>
          </div>
          <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
            {completedCount >= 3
              ? `"${user?.name || 'The engineer'} has demonstrated strong technical problem-solving ability in our engineering sprints. They are receptive to PR review comments, catch edge cases defensively, and operate with an owner's mindset. I would endorse them for any junior developer role."`
              : completedCount > 0
                ? `"${user?.name || 'The engineer'} has made good initial contributions to the codebase. Continued focus on test-driven development and code cleanliness will round out their skill set."`
                : `"Currently onboarding on the team. Looking forward to reviewing their first Pull Request."`}
          </p>
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>📊 Core Competencies Matrix</h3>
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
        <h3 style={{ marginBottom: 16 }}>📋 Sprint PR History</h3>
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
                    {state.timeTaken}m · {state.numberOfAttempts} attempt(s) · Score: {state.rating}/10
                    {state.isLate && ' · ⚠ Late'}
                  </div>
                </div>
                <span className={`badge ${state.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                  {state.xpEarned > 0 ? `+${state.xpEarned} XP` : state.status === 'needs-revision' ? 'Changes Requested' : '0 XP'}
                </span>
              </div>
            );
          })}
          {completedCount === 0 && (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 20 }}>
              No PRs merged yet. Pick up a ticket from the sprint backlog to begin!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
