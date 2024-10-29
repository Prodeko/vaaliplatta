import { useContext } from 'react';
import { createContext } from 'react';

export interface Election {
    id: number,
    name: string,
    draft: boolean,
    description: string,
    positions: Position[],
}

export interface Answer {
    content: string,
    question_id: number,
    answer_id: number,
    answerer_id: string,
    profile_picture: string | null,
    applicant_name: string,
    applicant_id: string,
    position_id: number,
}

export interface Question {
    id: number,
    asker_id: string,
    content: string,
    nickname: string,
    position_id: number,
    answers: Answer[]
}

export interface Position {
    id: number;
    election_id: number;
    description: string | null;
    name: string;
    seats: string | null;
    applications: Application[];
    questions?: Question[];
    category: string;
}

export interface Application {
    content: string;
    applicant_name: string;
    applicant_id: string;
    position_id: string;
    profile_picture?: string;
}

export interface AppContextType {
    BLOB_URL: string;
    API_URL: string;
    election: Election | null;
    getElection: (id: string) => Promise<void>;
    position: Position | "loading" | null;
    getPosition: (id: string) => Promise<void>;
    clearPosition: () => void;
    refreshPosition: () => void;
    application: Application | null;
    showApplication: (id: string) => void;
    ownApplication: Application | null;
    setOwnApplication: (application: Application | null) => void;
    clearApplication: () => void;
    showApplicationForm: boolean;
    setShowApplicationForm: (value: boolean) => void;
    showAdminEditApplicantsForm: boolean;
    setShowAdminEditApplicantsForm: (value: boolean) => void;
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
