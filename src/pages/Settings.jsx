import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/auth';
import {
  User, Lock, Palette, Download, AlertTriangle, CheckCircle2,
  Shield, LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser, logout, resetProgress } = useUser();
  const { taskStates, TASKS } = useTasks();
  const { theme, toggleTheme } = useTheme();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const [confirmReset, setConfirmReset] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    try {
      await updateUser({ name, email });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess(false);

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setPwdSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(false), 2500);
    } catch (err) {
      setPwdError(err.message || 'Error updating password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleExportPortfolio = () => {
    let md = `# NovaTech Engineering Internship — Verified Dossier\n\n`;
    md += `**Engineer:** ${user?.name || 'Intern'}\n`;
    md += `**Username:** @${user?.username || 'user'}\n`;
    md += `**Track:** ${user?.role === 'frontend' ? 'Frontend Engineer' : user?.role === 'backend' ? 'Backend Services' : 'AI/ML Engineering'}\n`;
    md += `**Current Level:** ${user?.rank || 'Intern'} (${user?.xp || 0} Velocity XP)\n`;
    md += `**Joined:** ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}\n\n`;
    md += `---\n\n## ATS Resume Bullet Points\n\n`;

    TASKS.filter(t => taskStates[t.id]?.status === 'completed').forEach(t => {
      md += `- Resolved production defect in ${t.title}: refactored core logic and passed peer review with ${taskStates[t.id]?.rating || 8}/10 score.\n`;
    });

    md += `\n---\n\n## Pull Requests Merged\n\n`;

    TASKS.forEach(task => {
      const state = taskStates[task.id];
      if (!state || state.status === 'locked') return;

      md += `### PR #${task.id}: ${task.title}\n\n`;
      md += `- **Difficulty:** ${task.difficulty}\n`;
      md += `- **Status:** ${state.status === 'completed' ? 'Merged ✅' : state.status}\n`;
      md += `- **Review Score:** ${state.rating}/10\n`;
      md += `- **Sprint Time:** ${state.timeTaken} minutes\n\n`;

      if (state.feedback) {
        md += `**Lead Engineer Review:**\n> ${state.feedback.summary || 'Approved'}\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novatech-internship-dossier-${(user?.username || 'intern')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 4 }}>Account & Workspace Settings</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>
          Manage your engineering identity, SaaS security credentials, and preferences.
        </p>
      </div>

      {/* Profile Details */}
      <div className="settings-section">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={18} /> Engineer Profile
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
          Your public name and identity across NovaTech Slack channels and GitHub PR reviews.
        </p>

        {profileError && (
          <div className="auth-error-banner" style={{ marginBottom: 12 }}>
            <AlertTriangle size={15} /> <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label>Full Name</label>
              <input
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Username</label>
              <input
                className="input"
                value={user?.username || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Work Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              {profileSaved ? <><CheckCircle2 size={14} /> Profile Saved</> : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password & Security */}
      <div className="settings-section">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={18} /> Security & Password
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
          Update your account password to secure your sprint progression.
        </p>

        {pwdError && (
          <div className="auth-error-banner" style={{ marginBottom: 12 }}>
            <AlertTriangle size={15} /> <span>{pwdError}</span>
          </div>
        )}

        {pwdSuccess && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginBottom: 12 }}>
            <CheckCircle2 size={16} /> <span>Password updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="input-group">
            <label>Current Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label>New Password</label>
              <input
                className="input"
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Confirm New Password</label>
              <input
                className="input"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" className="btn btn-secondary btn-sm" disabled={pwdLoading}>
              {pwdLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* SaaS Subscription Tier */}
      <div className="settings-section">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} /> SaaS Plan & Workspace Quotas
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              Developer Fellow Tier <span className="badge badge-accent">Active Plan</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Unlimited Monaco runs · In-browser CI/CD pipeline · Verified ATS resume export
            </div>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>
            $0 / Student Grant
          </span>
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <h3><Palette size={16} style={{ marginRight: 8 }} /> Appearance</h3>
        <div className="settings-row">
          <div>
            <div className="label">Workstation Theme</div>
            <div className="desc">Currently: {theme === 'dark' ? 'Dark Mode (Midnight Zinc)' : 'Light Mode (Clean Day)'}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Export Dossier */}
      <div className="settings-section">
        <h3><Download size={16} style={{ marginRight: 8 }} /> Export Verified Dossier</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
          Export a complete Markdown portfolio of all your merged Pull Requests, review scores, and ATS resume bullet points.
        </p>
        <button className="btn btn-secondary btn-sm" onClick={handleExportPortfolio} style={{ gap: 6 }}>
          <Download size={14} /> Export Dossier (.md)
        </button>
      </div>

      {/* Session Logout & Reset */}
      <div className="settings-section" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} /> Session & Data Management
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Sign Out</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>End your active workstation session on this device.</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={logout} style={{ gap: 6 }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--danger)' }}>Reset Sprint Progress</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Clear completed tickets and reset warnings back to day 1.</div>
            </div>
            <button
              className={`btn btn-sm ${confirmReset ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => {
                if (!confirmReset) {
                  setConfirmReset(true);
                  return;
                }
                resetProgress();
                setConfirmReset(false);
              }}
            >
              {confirmReset ? 'Confirm Reset?' : 'Reset Progress'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
