import React, { useState, useEffect } from 'react';
import { AppContext, AppContextType, Election, Position } from '../hooks/useAppState';
import axios from 'axios';
import { useParams } from "react-router"

interface Props {
    children: React.ReactNode
}

export const AppStateProvider: React.FC<Props> = ({ children }) => {
    const { electionId } = useParams();
    const [election, setElection] = useState<Election | null>(null);
    const [position, setPosition] = useState<Position | "loading" | null>(null);
    const [error, setError] = useState<string | null>(null);

    const URL = 'http://localhost:8000/api'

    const getElection = async (id: string) => axios
        .get(URL + '/election/' + id.toString())
        .then(result => setElection(result.data))
        .catch(error => console.error(error))

    const getPosition = async (id: string) => {

        // Check if the position already exists in AppState to speed up loading
        const position = election?.positions.find(p => p.id.toString() === id)
        if (position) setPosition(position)
        else setPosition("loading")

        await axios
            .get(URL + '/position/' + id.toString())
            .then(result => setPosition(result.data))
            .catch(error => {
                console.error(error)
                setError(error?.message ?? error.toString())
                setPosition(null)
            })
    }

    useEffect(() => {
        if (electionId) getElection(electionId)
        else getElection("newest")
    }, [electionId]);

    const value: AppContextType = { election, getElection, getPosition, position, error }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
};
