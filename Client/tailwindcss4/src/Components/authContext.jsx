// Client/tailwindcss4/src/Components/authContext.jsx
import React, { createContext, useContext, useState } from 'react';

// Create the authentication context
const AuthContext = createContext();

// AuthProvider component that holds the user state
export const AuthProvider = ({ children }) => {
    // Initially, no user is logged in.
    const [user, setUser] = useState(null);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access the AuthContext in any component
export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;
