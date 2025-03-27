import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // New loading state

    // On app startup, fetch the current user and bypass cache using a query parameter
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/users/getCurrentUser?t=${Date.now()}`, // Cache buster
                    { withCredentials: true }
                );
                if (response.data.successful && response.data.user) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.log("User not authenticated or token expired", error);
            } finally {
                setLoading(false); // Finished fetching
            }
        };

        fetchCurrentUser();
    }, []);

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
