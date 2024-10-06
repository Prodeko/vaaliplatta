import React, { useState, useEffect } from 'react';
import { ElectionContext, ElectionContextType, Election } from '../hooks/useElection';
import axios from 'axios';



interface Props {
    electionId: string | undefined,
    children: React.ReactNode
}

export const ElectionProvider: React.FC<Props> = ({ electionId, children }) => {
    const [election, setElection] = useState<Election | undefined>(undefined);

    const URL = 'http://localhost:8000/api'

    const getElection = async (id: string) => axios
        .get(URL + '/election/' + id)
        .then(result => setElection(result.data))
        .catch(error => console.error(error))

    useEffect(() => {
        if (electionId) getElection(electionId)
        else getElection("newest")
    }, [electionId]);

    const value: ElectionContextType = { election }

    return <ElectionContext.Provider value={value}>{children}</ElectionContext.Provider>
};
