import React, { useState, useEffect, useCallback } from 'react';
import { AppContext, AppContextType, Application, Election, Position } from '../hooks/useAppState';
import { useSearchParams } from "react-router-dom"
import { useAuth } from '../hooks/useAuth';
import useAuthenticatedRequests from '../hooks/useAuthenticatedRequests';

interface Props {
    children: React.ReactNode
}

export const AppStateProvider: React.FC<Props> = ({ children }) => {
    const [searchParams] = useSearchParams();
    const electionId = searchParams.get('electionId');
    const [election, setElection] = useState<Election | null>(null);
    const [position, setPosition] = useState<Position | "loading" | null>(null);
    const [application, setApplication] = useState<Application | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showApplicationForm, setShowApplicationForm] = useState<boolean>(false);
    const [ownApplication, setOwnApplication] = useState<Application | null>(null);
    const [showAdminEditApplicantsForm, setShowAdminEditApplicantsForm] = useState<boolean>(false);
    const [showAdminEditPositionDescriptionModal, setShowAdminEditPositionDescriptionModal] = useState<boolean>(false);
    const [showAdminEditElectionModal, setShowAdminEditElectionModal] = useState<boolean>(false);
    const [showAdminCreateElectionModal, setShowAdminCreateElectionModal] = useState<boolean>(false);
    const { session } = useAuth();
    const { get, post } = useAuthenticatedRequests()

    const getElection = useCallback(async (id: string) => get('/election/' + id)
        .then(result => setElection(result.data))
        // disabled on purpose
        // eslint-disable-next-line react-hooks/exhaustive-deps
        .catch(error => console.error(error)), [])

    const fetchPosition = async (id: string) => {
        await get('/position/' + id.toString())
            .then(result => {
                const p = result.data as Position
                setPosition(p)
                // Keep the election's cached copy in sync so navigating back doesn't show stale data
                setElection(prev => prev && p
                    ? { ...prev, positions: prev.positions.map(old => old.id === p.id ? { ...old, ...p } : old) }
                    : prev)
                if (session && p) setOwnApplication(p.applications.find(a => a.applicant_id === session.pk) || null)
            })
            .catch(error => {
                console.error(error)
                setError(error.toString())
                setPosition(null)
            })
    }

    const getPosition = async (id: string) => {

        // Check if the position already exists in AppState to speed up loading
        const position = election?.positions.find(p => p.id.toString() === id)
        if (position) setPosition(position)
        else setPosition("loading")

        await fetchPosition(id)
    }

    const refreshPosition = async () => {
        if (position && position !== "loading") await fetchPosition(position.id.toString())
    }

    const showApplication = async (applicationId: number) => {
        if (election && position && position != "loading") {
            setApplication(position?.applications.find(a => a.id === applicationId) || null)
            try {
                const receipt = await post('/application/' + applicationId.toString() + '/read', {})

                const newElection: Election = {
                    ...election,
                    positions: election.positions.map(p =>
                    ({
                        ...p, applications: p.applications.map(a =>
                            ({ ...a, ...receipt })
                        )
                    })
                    )
                }
                setElection(newElection)

            } catch (error) {
                console.error(error)
            }
        }
    }

    const clearPosition = () => setPosition(null)

    const clearApplication = () => setApplication(null)

    useEffect(() => {
        if (electionId) getElection(electionId)
        else getElection("newest")
    }, [electionId, getElection]);

    const value: AppContextType = {
        election,
        getElection,
        position,
        getPosition,
        clearPosition,
        refreshPosition,
        application,
        showApplication,
        ownApplication,
        setOwnApplication,
        clearApplication,
        showApplicationForm,
        setShowApplicationForm,
        showAdminEditApplicantsForm,
        setShowAdminEditApplicantsForm,
        showAdminEditPositionDescriptionModal,
        setShowAdminEditPositionDescriptionModal,
        showAdminEditElectionModal,
        setShowAdminEditElectionModal,
        showAdminCreateElectionModal,
        setShowAdminCreateElectionModal,
        error,
        setError,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
};
