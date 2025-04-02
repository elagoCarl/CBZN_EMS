import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../axiosConfig';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // Flag to mark that a refresh attempt has failed so we don’t keep trying
    const [refreshFailed, setRefreshFailed] = useState(false);
    const location = useLocation();

    // Define public routes that do not require any auth or token refresh
    const publicRoutes = ['/', '/forgotPass'];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    useEffect(() => {
        // If on a public route, skip fetching the user
        if (isPublicRoute) {
            setLoading(false);
            return;
        }

        // If a previous refresh attempt has failed, skip further requests
        if (refreshFailed) {
            setLoading(false);
            return;
        }

        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get(
                    `/users/getCurrentUser?t=${Date.now()}`, // Cache buster
                    { withCredentials: true }
                );
                if (response.data.successful && response.data.user) {
                    setUser(response.data.user);
                } else {
                    setRefreshFailed(true);
                }
            } catch (error) {
                console.log("User not authenticated or token expired", error);
                setRefreshFailed(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, [isPublicRoute, refreshFailed]);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
