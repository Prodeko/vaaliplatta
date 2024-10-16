import React, { useState, ReactNode, useEffect } from 'react';
import { AuthContext, AuthContextType } from '../hooks/useAuth';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<Token | null>(localStorage.getItem("token"));
    const [user, setUser] = useState<string | null>(localStorage.getItem("user"));

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const user = urlParams.get('user');

        if (token) {
            localStorage.setItem('token', token);
            setToken(token)
        }
        if (user) {
            localStorage.setItem('user', user)
            setUser(user)
        }
    }, [])

    const login = async () => {
        console.log("login")
        window.location.href = import.meta.env.VITE_ROOT_URL + "/oauth2/login";
    }

    const logout = () => {
        console.log("logout")
        setToken(null);
        setUser(null)
        localStorage.removeItem('token');
        localStorage.removeItem('user')
    };

    const value: AuthContextType = { token, user, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
