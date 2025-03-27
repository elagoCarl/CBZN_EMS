import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // While loading, you can render a spinner or nothing
  if (loading) {
    return <div>Loading...</div>; // Or any loading indicator
  }

  // If user is still null after loading, then redirect to login
  return user ? children : <Navigate to="/" />;
};
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
