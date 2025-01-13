import { createContext, useContext } from "react";

export interface Session {
    pk: string,
    email: string,
    first_name: string,
    last_name: string,
    is_superuser: boolean
}

export interface AuthContextType {
    session: Session | null;
    login: () => void;
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