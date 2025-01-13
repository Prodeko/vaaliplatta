import React, { useState, ReactNode, useEffect, useCallback } from 'react';
import { AuthContext, AuthContextType } from '../hooks/useAuth';
import useConfig from '../hooks/useConfig';
import axios from 'axios';
import { Session } from '../hooks/useAuth';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const { LOGIN_URL, LOGOUT_URL, API_URL } = useConfig();

    const getSessionDetails = useCallback(async () => {
        return axios.get(API_URL + "/session", { withCredentials: true })
            .then(result => result.data as Session)
            .catch(() => null);
    }, [API_URL]);

    useEffect(() => {
        (async () => {
            const session = await getSessionDetails();
            setSession(session);
        })();
    }, [getSessionDetails]);

    const login = async () => {
        console.log("login");
        window.location.href = LOGIN_URL;
    };

    const logout = () => {
        console.log("logout");
        axios.post(LOGOUT_URL, {}, { withCredentials: true })
            .then(() => setSession(null))
            .catch(error => console.error(error))
    };

    const value: AuthContextType = { session, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
