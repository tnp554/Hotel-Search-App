import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const adminSession = localStorage.getItem('adminSession');

  if (!adminSession) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const session = JSON.parse(adminSession);
    if (session.email === 'admin@support.com' && session.role === 'admin') {
      return children;
    }
  } catch (error) {
    console.error('Invalid admin session:', error);
  }

  return <Navigate to="/admin/login" replace />;
};

export default ProtectedAdminRoute;