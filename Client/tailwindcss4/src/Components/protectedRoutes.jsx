import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoutes = ({ isAuthenticated, hasPermission }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" />; // Redirect to login if not authenticated
  }

  if (!hasPermission) {
    return <Navigate to="/403" />; // Redirect to 403 if no permission
  }

  return <Outlet />; // Allow access if authenticated & authorized
};

ProtectedRoutes.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  hasPermission: PropTypes.bool.isRequired,
};

export default ProtectedRoutes;
