import { useContext } from 'react';
import { createContext } from 'react';

export interface Election {
    id: number,
    name: string,
    draft: boolean,
    description: string,
    positions: Position[],
}

export interface Position {
    id: number;
    election_id: number;
    description: string | null;
    name: string;
    seats: string | null;
    applications: Application[];
}

export interface Application {
    content: string;
    applicant_name: string;
    applicant_id: string;
    position_id: string;
}

export interface AppContextType {
    election: Election | null;
    position: Position | "loading" | null;
    application: Application | null;
    error: string | null;
    getElection: (id: string) => Promise<void>;
    getPosition: (id: string) => Promise<void>;
    clearPosition: () => void;
    showApplication: (id: string) => void;
    clearApplication: () => void;
    setError: (value: string | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppState = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
};
