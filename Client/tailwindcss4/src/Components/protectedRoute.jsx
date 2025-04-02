import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While checking authentication, show a loading indicator
  if (loading) {
    return (
      <div className="rounded-md h-12 w-12 border-4 border-t-4 border-blue-500 animate-spin absolute"></div>
    );
  }

  // If not authenticated, redirect to the login page
  if (!user) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  // If admin-only and the user is not an admin, redirect to a 403 page
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/403" state={{ from: location }} />;
  }

  // Otherwise, render the child components
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  adminOnly: PropTypes.bool,
};

ProtectedRoute.defaultProps = {
  adminOnly: false,
};

export default ProtectedRoute;
