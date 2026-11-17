import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { TaskProvider } from './contexts/TaskContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Chat from './pages/Chat';
import Progress from './pages/Progress';
import Settings from './pages/Settings';

function AppRoutes() {
  const { user, isAuthenticated, resetProgress } = useUser();

  if (isAuthenticated && user?.terminated) {
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
          <h1 style={{ marginBottom: 8, color: 'var(--danger)' }}>Performance Review Triggered</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
            Due to 3 repeated task failures, your internship placement has been placed under administrative review. This reflects real-world performance protocols.
          </p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 24 }}>
            As this is an engineering simulator, you can reset your warnings and retry the sprint tickets.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={resetProgress}
          >
            Reset Sprint Warnings
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public SaaS Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
      />

      {/* Protected SaaS App Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Layout><Tasks /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/task/:id"
        element={
          <ProtectedRoute>
            <Layout><TaskDetail /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Layout><Chat /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Layout><Progress /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
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
