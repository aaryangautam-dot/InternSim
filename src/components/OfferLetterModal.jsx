import { useState } from 'react';
import {
  Award, CheckCircle2, Building2, MapPin, DollarSign,
  Briefcase, Download, ArrowRight, X, Sparkles, FileSignature
} from 'lucide-react';
import { playSound } from '../utils/sound';

export default function OfferLetterModal({
  isOpen,
  onClose,
  company,
  userName,
  onAcceptOffer,
  alreadySigned = false,
}) {
  const [signed, setSigned] = useState(alreadySigned);
  const [signingName, setSigningName] = useState(userName || '');

  if (!isOpen || !company) return null;

  const handleSign = () => {
    playSound.success();
    setSigned(true);
    if (onAcceptOffer) {
      onAcceptOffer(company.id);
    }
  };

  const handleDownloadLetter = () => {
    let text = `=================================================================\n`;
    text += `       OFFICIAL OFFER OF EMPLOYMENT — ${company.brandName.toUpperCase()}\n`;
    text += `=================================================================\n\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n`;
    text += `Candidate: ${userName || 'Intern Candidate'}\n`;
    text += `Position: ${company.offerDetails.roleTitle}\n`;
    text += `Department: ${company.offerDetails.department}\n`;
    text += `Compensation: ${company.stipend}\n`;
    text += `Location: ${company.offerDetails.location}\n\n`;
    text += `Dear ${userName || 'Candidate'},\n\n`;
    text += `${company.offerDetails.congratulationsNote}\n\n`;
    text += `Based on your rigorous problem solving, successful pull request reviews, and engineering velocity, we are delighted to welcome you to our engineering organization.\n\n`;
    text += `Key Perks & Benefits:\n`;
    company.offerDetails.perks.forEach(p => { text += `- ${p}\n`; });
    text += `\nStatus: ${signed ? 'ACCEPTED & VERIFIED WITH DIGITAL SIGNATURE' : 'PENDING SIGNATURE'}\n`;
    text += `Signature: ${signed ? signingName : '[Unsigned]'}\n`;
    text += `=================================================================\n`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company.id}-offer-letter-${(userName || 'intern').toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 720,
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          border: `2px solid ${company.accentColor}`,
          boxShadow: `0 12px 48px rgba(0,0,0,0.6), 0 0 32px ${company.accentColor}33`,
          background: 'var(--bg-primary)'
        }}
      >
        {/* Top Decorative Banner */}
        <div style={{
          padding: '24px 32px',
          background: company.gradient,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(0,0,0,0.3)', padding: '3px 10px',
              borderRadius: 12, fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8
            }}>
              <Award size={13} /> Tier {company.tier} · {company.stage}
            </span>
            <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#fff', fontWeight: 800 }}>
              {company.brandName}
            </h2>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.88rem' }}>
              Official Letter of Employment & Technical Promotion
            </p>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            style={{ color: 'white', background: 'rgba(0,0,0,0.2)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Letter Body */}
        <div style={{ padding: '28px 32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Addressee */}
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Confidential Employment Offer
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem' }}>
              Dear {userName || 'Engineer'},
            </h3>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
            {company.offerDetails.congratulationsNote}
          </p>

          {/* Offer Specifics Box */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                <Briefcase size={14} style={{ color: company.accentColor }} /> Position
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{company.offerDetails.roleTitle}</div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                <Building2 size={14} style={{ color: company.accentColor }} /> Department
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{company.offerDetails.department}</div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                <DollarSign size={14} style={{ color: company.accentColor }} /> Stipend & Package
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--success)' }}>{company.stipend}</div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                <MapPin size={14} style={{ color: company.accentColor }} /> Location
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{company.offerDetails.location}</div>
            </div>
          </div>

          {/* Perks list */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Included Benefits & Engineering Privileges
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {company.offerDetails.perks.map((perk, i) => (
                <span
                  key={i}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Sparkles size={12} style={{ color: company.accentColor }} /> {perk}
                </span>
              ))}
            </div>
          </div>

          {/* e-Signature Area */}
          <div style={{
            marginTop: 8,
            padding: 20,
            borderRadius: 'var(--radius-lg)',
            background: signed ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-elevated)',
            border: signed ? '1px solid var(--success)' : '1px dashed var(--border)',
            textAlign: 'center'
          }}>
            {signed ? (
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>
                  <CheckCircle2 size={20} /> OFFICIAL OFFER DIGITALLY ACCEPTED
                </div>
                <div style={{
                  fontFamily: "'Brush Script MT', 'Dancing Script', cursive, sans-serif",
                  fontSize: '2rem',
                  color: 'var(--accent)',
                  margin: '8px 0',
                  transform: 'rotate(-2deg)'
                }}>
                  {signingName || userName || 'Verified Engineer'}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
                  Cryptographically registered on InternSim Career Ledger · {new Date().toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                  <FileSignature size={18} style={{ color: company.accentColor }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Accept & Digitally Sign Offer</span>
                </div>
                <div style={{ display: 'flex', gap: 8, maxWidth: 360, margin: '0 auto' }}>
                  <input
                    className="input"
                    value={signingName}
                    onChange={e => setSigningName(e.target.value)}
                    placeholder="Type your full legal name"
                    style={{ textAlign: 'center', fontWeight: 600 }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleSign}
                    disabled={!signingName.trim()}
                    style={{ background: company.gradient, border: 'none', gap: 6 }}
                  >
                    Sign Offer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 32px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)'
        }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleDownloadLetter}
            style={{ gap: 6 }}
          >
            <Download size={14} /> Download Offer Letter
          </button>

          <button
            className="btn btn-primary"
            onClick={onClose}
            style={{ background: company.gradient, border: 'none', gap: 6 }}
          >
            {signed ? 'Enter Company Workspace' : 'Review Later'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
