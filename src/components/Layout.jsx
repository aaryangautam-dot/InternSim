import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import {
  Kanban, ListTodo, MessageSquareCode, Award,
  Settings, Sun, Moon, Zap, Menu, X, ShieldAlert, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Kanban, label: 'Sprint Board' },
  { to: '/tasks', icon: ListTodo, label: 'Tickets' },
  { to: '/chat', icon: MessageSquareCode, label: 'Team Slack' },
  { to: '/progress', icon: Award, label: 'Career Dossier' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const { getCompletedCount, TASKS: allTasks } = useTasks();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = NAV_ITEMS.find(n => location.pathname.startsWith(n.to))?.label
    || (location.pathname.includes('/task/') ? 'Code Review & Ticket' : 'NovaTech Engineering OS');

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ background: 'var(--accent-gradient)' }}>
            <Zap size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>NovaTech</h1>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Engineering OS
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" size={18} />
                <span>{item.label}</span>
                {item.label === 'Tickets' && (
                  <span className="nav-badge">
                    {getCompletedCount()}/{allTasks.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div className="user-avatar" style={{ background: 'var(--accent)' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Intern Engineer'}
              </div>
              <div className="user-role">{user?.rank || 'Intern'} · {user?.xp || 0} XP</div>
            </div>
            <button
              className="btn btn-ghost btn-icon"
              onClick={logout}
              title="Sign out of engineering account"
              style={{ width: 28, height: 28, color: 'var(--text-tertiary)', flexShrink: 0 }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2>{pageTitle}</h2>
              <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                Sprint 4 (Active)
              </span>
            </div>
          </div>
          <div className="topbar-right">
            {user?.warnings > 0 && (
              <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldAlert size={13} /> {user.warnings}/3 Performance Warnings
              </span>
            )}
            {user?.streak > 0 && (
              <span className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                🔥 {user.streak} day streak
              </span>
            )}
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <div className={location.pathname.startsWith('/task/') ? '' : 'page-content'}>
          {children}
        </div>
      </main>
    </div>
  );
}
