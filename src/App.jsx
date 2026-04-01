import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { TaskProvider } from './contexts/TaskContext';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Chat from './pages/Chat';
import Progress from './pages/Progress';
import Settings from './pages/Settings';

function AppRoutes() {
  const { user } = useUser();

  if (user.terminated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: 24,
      }}>
        <div className="card" style={{ maxWidth: 520, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ marginBottom: 8, color: 'var(--danger)' }}>Performance Review</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
            Due to repeated task failures, your internship at NovaTech has been
            placed under review. This is what happens in a real company when
            performance expectations aren't met.
          </p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 24 }}>
            But this is a simulation — you can start over and try again.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
          >
            Restart Internship
          </button>
        </div>
      </div>
    );
  }

  if (!user.onboarded) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/task/:id" element={<TaskDetail />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <UserProvider>
          <TaskProvider>
            <AppRoutes />
          </TaskProvider>
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
