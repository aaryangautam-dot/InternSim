import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
