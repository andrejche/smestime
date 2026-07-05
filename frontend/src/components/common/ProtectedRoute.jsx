import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
