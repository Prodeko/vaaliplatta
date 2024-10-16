import React, { useState, ReactNode, useEffect } from 'react';
import { AuthContext, AuthContextType } from '../hooks/useAuth';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<Token | null>(localStorage.getItem("token"));

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            localStorage.setItem('token', token);
            setToken(token)
        }
    }, [])

    const login = async () => {
        console.log("login")
        window.location.href = 'http://localhost:8000/oauth2/login';
    }

    const logout = () => {
        console.log("logout")
        setToken(null);
        localStorage.removeItem('token');
    };

    const value: AuthContextType = { token, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
