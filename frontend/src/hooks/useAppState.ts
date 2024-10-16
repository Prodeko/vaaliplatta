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
    getElection: (id: string) => Promise<void>;
    position: Position | "loading" | null;
    getPosition: (id: string) => Promise<void>;
    clearPosition: () => void;
    application: Application | null;
    showApplication: (id: string) => void;
    clearApplication: () => void;
    showApplicationForm: boolean;
    setShowApplicationForm: (value: boolean) => void;
    error: string | null;
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
