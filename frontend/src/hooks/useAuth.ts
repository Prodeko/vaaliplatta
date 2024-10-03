import { createContext, useContext } from "react";

export interface AuthContextType {
    token: Token | null;
    login: (password: string) => Promise<Result<Token, AuthError>>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};