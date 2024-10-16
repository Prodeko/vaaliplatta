import React, { useState, ReactNode } from 'react';
import { AuthContext, AuthContextType } from '../hooks/useAuth';
import axios from 'axios';

interface AuthProviderProps {
    children: ReactNode;
}

interface LoginResponse {
    message: string;
    token: Token;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<Token | null>(() => localStorage.getItem('token'));

    const login = async (password: string): Promise<Result<Token, AuthError>> => {
        return axios.post<LoginResponse>('http://localhost:8000/api/login', { password })
            .then(response => {
                const token = response.data.token
                setToken(token as Token)
                localStorage.setItem('token', token as Token)
                return { ok: true, value: token } as Result<Token, AuthError>
            }
            )
            .catch(error => ({ ok: false, error: error?.response?.data?.message } as Result<Token, AuthError>))
    }

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    const value: AuthContextType = { userId: Math.floor(Math.random() * 1000_000).toString(), token, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
