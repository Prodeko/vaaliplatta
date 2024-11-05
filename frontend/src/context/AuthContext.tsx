import React, { useState, ReactNode, useEffect } from 'react';
import { AuthContext, AuthContextType } from '../hooks/useAuth';
import useConfig from '../hooks/useConfig';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<Token | null>(localStorage.getItem("token"));
    const [user, setUser] = useState<string | null>(localStorage.getItem("user"));
    const [superuser, setSuperUser] = useState<boolean>(localStorage.getItem("superuser")?.toLowerCase() === "true");
    const { LOGIN_URL } = useConfig();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const user = urlParams.get('user');
        const superuser = urlParams.get('superuser')?.toLowerCase();

        if (token) {
            localStorage.setItem('token', token);
            setToken(token)
        }
        if (user) {
            localStorage.setItem('user', user)
            setUser(user)
        }
        if (superuser === "true") {
            localStorage.setItem('superuser', superuser)
            setSuperUser(true)
        }
    }, [])

    const login = async () => {
        console.log("login")
        window.location.href = LOGIN_URL;
    }

    const logout = () => {
        console.log("logout")
        setToken(null);
        setUser(null)
        setSuperUser(false)
        localStorage.removeItem('token');
        localStorage.removeItem('user')
        localStorage.removeItem('superuser')
        window.location.href = "/"
    };

    const value: AuthContextType = { token, user, superuser, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
