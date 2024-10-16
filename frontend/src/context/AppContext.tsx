import React, { useState, useEffect, useCallback } from 'react';
import { AppContext, AppContextType, Application, Election, Position } from '../hooks/useAppState';
import axios from 'axios';
import { useParams } from "react-router"
import { useAuth } from '../hooks/useAuth';

interface Props {
    children: React.ReactNode
}

export const AppStateProvider: React.FC<Props> = ({ children }) => {
    const { electionId } = useParams();
    const [election, setElection] = useState<Election | null>(null);
    const [position, setPosition] = useState<Position | "loading" | null>(null);
    const [application, setApplication] = useState<Application | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showApplicationForm, setShowApplicationForm] = useState<boolean>(false);
    const [BLOB_URL] = useState<string>(import.meta.env.VITE_BLOB_URL)
    const [API_URL] = useState<string>(import.meta.env.VITE_API_URL)
    const [ownApplication, setOwnApplication] = useState<Application | null>(null);
    const { user } = useAuth()

    const getElection = useCallback(async (id: string) => axios.get(API_URL + '/election/' + id)
        .then(result => setElection(result.data))
        .catch(error => console.error(error)), [API_URL])

    const getPosition = async (id: string) => {

        // Check if the position already exists in AppState to speed up loading
        const position = election?.positions.find(p => p.id.toString() === id)
        if (position) setPosition(position)
        else setPosition("loading")

        await axios.get(API_URL + '/position/' + id.toString())
            .then(result => {
                const p = result.data as Position
                setPosition(p)
                if (user && p) setOwnApplication(p.applications.find(a => a.applicant_id === user) || null)
            })
            .catch(error => {
                console.error(error)
                setError(error.toString())
                setPosition(null)
            })
    }

    const showApplication = (id: string) => {
        if (position && position != "loading") setApplication(position?.applications.find(a => a.applicant_id.toString() === id) || null)
    }

    const clearPosition = () => setPosition(null)

    const clearApplication = () => setApplication(null)

    useEffect(() => {
        if (electionId) getElection(electionId)
        else getElection("newest")
    }, [electionId, getElection]);

    const value: AppContextType = {
        BLOB_URL,
        API_URL,
        election,
        getElection,
        position,
        getPosition,
        clearPosition,
        application,
        showApplication,
        ownApplication,
        setOwnApplication,
        clearApplication,
        showApplicationForm,
        setShowApplicationForm,
        error,
        setError,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
};
