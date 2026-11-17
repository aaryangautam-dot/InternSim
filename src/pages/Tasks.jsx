import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import { COMPANIES, getCompanyById } from '../data/companies';
import OfferLetterModal from '../components/OfferLetterModal';
import {
  Clock, AlertTriangle, ChevronRight, Lock, CheckCircle2, RotateCcw,
  GitBranch, GitPullRequest, Building2, Award, Sparkles, FileSignature
} from 'lucide-react';

export default function Tasks() {
  const { user, switchCompany, signOfferLetter } = useUser();
  const { taskStates, TASKS, checkPromotionEligibility } = useTasks();
  const navigate = useNavigate();

  const [selectedCompanyId, setSelectedCompanyId] = useState(user?.currentCompanyId || 'novatech');
  const [offerModalCompany, setOfferModalCompany] = useState(null);

  const handleSelectCompany = (cid) => {
    setSelectedCompanyId(cid);
    if (user?.unlockedCompanies?.includes(cid)) {
      switchCompany(cid);
    }
  };

  const selectedCompany = getCompanyById(selectedCompanyId) || COMPANIES[0];
  const userRole = user?.role || 'frontend';
  const companyTaskIds = selectedCompany?.taskIdsByRole?.[userRole] || [];
  const companyTasks = TASKS.filter(t => companyTaskIds.includes(t.id));

  const isUnlocked = user?.unlockedCompanies?.includes(selectedCompanyId);
  const isSigned = user?.signedOfferLetters?.includes(selectedCompanyId);
  const promoStatus = checkPromotionEligibility(selectedCompanyId);

  const difficultyColors = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-danger' };
  const impactColors = { low: 'badge-neutral', medium: 'badge-info', high: 'badge-danger' };

  return (
    <div className="animate-in">
      {/* Offer Letter Modal */}
      {offerModalCompany && (
        <OfferLetterModal
          isOpen={!!offerModalCompany}
          onClose={() => setOfferModalCompany(null)}
          company={offerModalCompany}
          userName={user?.name || 'Engineer'}
          alreadySigned={user?.signedOfferLetters?.includes(offerModalCompany.id)}
          onAcceptOffer={(cid) => {
            signOfferLetter(cid);
            setSelectedCompanyId(cid);
          }}
        />
      )}

      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>Career Trajectory & Engineering Tiers</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>
          Progress through tiers of software organizations. Solve real production tickets to earn promotions and prestigious offer letters.
        </p>
      </div>

      {/* Company Level Selector Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 12,
        marginBottom: 20
      }}>
        {COMPANIES.map(company => {
          const unlocked = user?.unlockedCompanies?.includes(company.id);
          const active = selectedCompanyId === company.id;
          const signed = user?.signedOfferLetters?.includes(company.id);

          return (
            <div
              key={company.id}
              onClick={() => handleSelectCompany(company.id)}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: active ? `2px solid ${company.accentColor}` : '1px solid var(--border)',
                background: active ? 'var(--bg-card)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: active ? `0 4px 20px ${company.accentColor}22` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                  background: active ? company.accentColor : 'var(--bg-elevated)',
                  color: active ? '#fff' : 'var(--text-secondary)'
                }}>
                  Tier {company.tier} · {company.stage}
                </span>

                {unlocked ? (
                  signed ? (
                    <span style={{ fontSize: '0.72rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                      <CheckCircle2 size={13} /> Active Org
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                      <Sparkles size={13} /> Offer Ready
                    </span>
                  )
                ) : (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Lock size={12} /> Locked
                  </span>
                )}
              </div>

              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {company.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                {company.headcount} · {company.valuation}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Company Vibe & Status Banner */}
      <div className="card" style={{
        marginBottom: 24,
        padding: '20px 24px',
        borderLeft: `4px solid ${selectedCompany.accentColor}`,
        background: 'var(--bg-secondary)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Building2 size={18} style={{ color: selectedCompany.accentColor }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{selectedCompany.brandName}</h3>
              <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                {selectedCompany.stage}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: '6px 0 10px' }}>
              <strong>Workplace Culture:</strong> {selectedCompany.culture}
            </p>
            <div style={{ fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              "{selectedCompany.managerQuote}"
            </div>
          </div>

          {/* Action buttons on banner */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            {isUnlocked ? (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setOfferModalCompany(selectedCompany)}
                style={{ gap: 6 }}
              >
                <FileSignature size={14} style={{ color: selectedCompany.accentColor }} />
                {isSigned ? 'View Signed Offer Letter' : 'Review & Sign Offer Letter'}
              </button>
            ) : (
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Lock size={12} /> Promotion Locked
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '4px 0 0', maxWidth: 220 }}>
                  Must complete Tier {selectedCompany.tier - 1} tickets with ≥ {COMPANIES[selectedCompany.tier - 2]?.promotionCriteria.minAverageScore} avg PR score.
                </p>
              </div>
            )}

            {/* If eligible for next tier promotion! */}
            {promoStatus.eligible && selectedCompany.promotionCriteria.nextCompanyId && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const nextComp = getCompanyById(selectedCompany.promotionCriteria.nextCompanyId);
                  setOfferModalCompany(nextComp);
                }}
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  gap: 6,
                  animation: 'pulse 2s infinite'
                }}
              >
                <Sparkles size={14} /> Claim {promoStatus.nextCompany?.name} Offer Letter!
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Backlog Section */}
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', margin: 0 }}>
          {selectedCompany.name} Assigned Tickets ({companyTasks.length})
        </h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
          Stipend: {selectedCompany.stipend}
        </span>
      </div>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {companyTasks.map((task, index) => {
          const state = taskStates[task.id] || {};
          const isLocked = state.status === 'locked' || !isUnlocked;
          const isCompleted = state.status === 'completed';
          const needsRevision = state.status === 'needs-revision';
          const isActive = state.status === 'in-progress';
          const storyPoints = task.difficulty === 'easy' ? '2 SP' : task.difficulty === 'medium' ? '5 SP' : '8 SP';

          return (
            <div
              key={task.id}
              className={`card task-card ${isLocked ? '' : 'card-glass'}`}
              style={{
                opacity: isLocked ? 0.45 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                borderColor: isActive ? 'var(--accent)' : needsRevision ? 'var(--danger)' : undefined,
                transition: 'all 0.2s ease',
              }}
              onClick={() => !isLocked && navigate(`/task/${task.id}`)}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isCompleted ? 'var(--success-bg)' : isActive ? 'var(--accent-muted)' : needsRevision ? 'var(--danger-bg)' : 'var(--bg-elevated)',
                color: isCompleted ? 'var(--success)' : isActive ? 'var(--accent)' : needsRevision ? 'var(--danger)' : 'var(--text-tertiary)',
                fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
              }}>
                {isLocked ? <Lock size={18} /> : isCompleted ? <CheckCircle2 size={20} /> : needsRevision ? <RotateCcw size={18} /> : <GitPullRequest size={18} />}
              </div>

              <div className="task-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                    {selectedCompany.name.slice(0, 3).toUpperCase()}-{100 + index + 1}
                  </span>
                  <span className={`badge ${difficultyColors[task.difficulty]}`}>{task.difficulty}</span>
                  <span className={`badge ${impactColors[task.impact]}`}>Priority: {task.impact === 'high' ? 'P0' : 'P1'}</span>
                  <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>{storyPoints}</span>
                </div>

                <div className="task-title" style={{ fontSize: '0.98rem', fontWeight: 600 }}>
                  {task.title}
                </div>

                <div className="task-meta" style={{ marginTop: 6, fontSize: '0.78rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)' }}>
                    <GitBranch size={12} /> fix/{task.id}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> SLA Target: {task.deadlineMinutes}m
                  </span>
                </div>
              </div>

              <div className="task-actions">
                {isCompleted && state.rating && (
                  <span className={`badge ${state.rating >= 7 ? 'badge-success' : state.rating >= 5 ? 'badge-warning' : 'badge-danger'}`}>
                    PR Approved ({state.rating}/10)
                  </span>
                )}
                {needsRevision && (
                  <span className="badge badge-danger">
                    <AlertTriangle size={12} /> Changes Requested
                  </span>
                )}
                {isActive && (
                  <span className="badge badge-accent">
                    In Review / Dev
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
