import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import {
  LayoutDashboard, ListChecks, MessageSquare, TrendingUp,
  Settings, Sun, Moon, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: ListChecks, label: 'Tasks' },
  { to: '/chat', icon: MessageSquare, label: 'Messages' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const { getCompletedCount, TASKS: allTasks } = useTasks();
  const location = useLocation();

  const pageTitle = NAV_ITEMS.find(n => location.pathname.startsWith(n.to))?.label
    || (location.pathname.includes('/task/') ? 'Task' : 'InternSim');

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Zap size={20} />
          </div>
          <h1>InternSim</h1>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" size={20} />
              <span>{label}</span>
              {label === 'Tasks' && (
                <span className="nav-badge">
                  {getCompletedCount()}/{allTasks.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="user-info">
              <div className="user-name">{user.name || 'Intern'}</div>
              <div className="user-role">{user.rank} · {user.xp} XP</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h2>{pageTitle}</h2>
          </div>
          <div className="topbar-right">
            {user.streak > 0 && (
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
