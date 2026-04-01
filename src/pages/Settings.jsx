import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import { useTheme } from '../contexts/ThemeContext';
import { Key, Palette, RotateCcw, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, resetProgress } = useUser();
  const { taskStates, TASKS, resetTasks } = useTasks();
  const { theme, toggleTheme } = useTheme();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('internsim-apikey') || '');
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveKey = () => {
    localStorage.setItem('internsim-apikey', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetProgress();
    resetTasks();
    localStorage.removeItem('internsim-chat');
    localStorage.removeItem('internsim-apikey');
    window.location.href = '/';
  };

  const handleExportPortfolio = () => {
    let md = `# InternSim Portfolio — ${user.name}\n\n`;
    md += `**Role:** ${user.role === 'frontend' ? 'Frontend Developer' : user.role}\n`;
    md += `**Rank:** ${user.rank} (${user.xp} XP)\n`;
    md += `**Joined:** ${user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}\n\n`;
    md += `---\n\n## Tasks Completed\n\n`;

    TASKS.forEach(task => {
      const state = taskStates[task.id];
      if (!state || state.status === 'locked') return;

      md += `### ${task.title}\n\n`;
      md += `- **Difficulty:** ${task.difficulty}\n`;
      md += `- **Status:** ${state.status}\n`;
      md += `- **Score:** ${state.rating}/10\n`;
      md += `- **Time:** ${state.timeTaken} minutes\n`;
      md += `- **Attempts:** ${state.numberOfAttempts}\n`;

      if (state.feedback) {
        md += `\n**Review Feedback:**\n`;
        md += `> ${state.feedback.summary || 'No summary'}\n\n`;
        if (state.feedback.strengths?.length) {
          md += `**Strengths:**\n`;
          state.feedback.strengths.forEach(s => { md += `- ${s}\n`; });
        }
        if (state.feedback.improvements?.length) {
          md += `\n**Areas for Improvement:**\n`;
          state.feedback.improvements.forEach(s => { md += `- ${s}\n`; });
        }
      }
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `internsim-portfolio-${user.name?.replace(/\s+/g, '-').toLowerCase() || 'intern'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in" style={{ maxWidth: 680 }}>
      <h2 style={{ marginBottom: 24 }}>Settings</h2>

      {/* API Key */}
      <div className="settings-section">
        <h3><Key size={16} style={{ marginRight: 8 }} /> OpenAI API Key</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
          Required for AI manager and code review features. Your key is stored locally and never sent to any server except OpenAI.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-..."
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleSaveKey}>
            {saved ? <><CheckCircle2 size={16} /> Saved</> : 'Save'}
          </button>
        </div>
        {!apiKey && (
          <p style={{ color: 'var(--warning)', fontSize: '0.8rem', marginTop: 8 }}>
            ⚠ Without an API key, the AI will use pre-written fallback responses.
          </p>
        )}
      </div>

      {/* Theme */}
      <div className="settings-section">
        <h3><Palette size={16} style={{ marginRight: 8 }} /> Appearance</h3>
        <div className="settings-row">
          <div>
            <div className="label">Theme</div>
            <div className="desc">Currently: {theme === 'dark' ? 'Dark (Orange + Black)' : 'Light (Blue + White)'}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Export */}
      <div className="settings-section">
        <h3><Download size={16} style={{ marginRight: 8 }} /> Portfolio Export</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
          Download a Markdown file with all your completed tasks, scores, and feedback.
        </p>
        <button className="btn btn-secondary" onClick={handleExportPortfolio}>
          <Download size={16} /> Export as Markdown
        </button>
      </div>

      {/* Reset */}
      <div className="settings-section">
        <h3><RotateCcw size={16} style={{ marginRight: 8 }} /> Reset Progress</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
          This will clear all progress, tasks, chat history, and settings. This cannot be undone.
        </p>
        <button className={`btn ${confirmReset ? 'btn-danger' : 'btn-secondary'}`} onClick={handleReset}>
          <AlertTriangle size={16} /> {confirmReset ? 'Confirm Reset — Are you sure?' : 'Reset Everything'}
        </button>
      </div>
    </div>
  );
}
