import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  console.log("User object:", user);
  console.log("Current path:", location.pathname);

  // Render a loading indicator while the auth state is being determined
  if (loading) {
    return (
      <div className="rounded-md h-12 w-12 border-4 border-t-4 border-blue-500 animate-spin absolute"></div>
    );
  }

  // If no user is found, redirect to the login page
  if (!user) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  // Check if route requires admin and user is not an admin
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/403" state={{ from: location }} />;
  }

  // If the user is logged in and verified, render the child component(s)
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  adminOnly: PropTypes.bool
};

ProtectedRoute.defaultProps = {
  adminOnly: false
};

export default ProtectedRoute;