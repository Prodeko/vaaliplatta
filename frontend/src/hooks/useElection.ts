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
    description: string | null;
    election_id: number;
    id: number;
    name: string;
    seats: string | null;
}

export interface ElectionContextType {
    election: Election | undefined;
}

export const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export const useElection = (): ElectionContextType => {
    const context = useContext(ElectionContext);
    if (!context) {
        throw new Error('useElection must be used within an ElectionProvider');
    }
    return context;
};
