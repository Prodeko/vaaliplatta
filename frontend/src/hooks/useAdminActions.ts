import { useState } from 'react';
import axios from 'axios';

const useAdminActions = () => {
    const [error, setError] = useState<string | null>(null);

    const handleAddElection = async (name: string, description: string) => {
        try {
            await axios.post('http://localhost:8000/api/election', {
                name,
                description,
                draft: false,
            }, {
                withCredentials: true
            });
            alert('Election added successfully');
        } catch (error) {
            console.error(error);
            setError('Failed to add election');
        }
    };

    const handleDeleteElection = async (id: number) => {
        try {
            await axios.delete(`http://localhost:8000/api/election/${id}`, {
                withCredentials: true
            });
            alert('Election deleted successfully');
        } catch (error) {
            console.error(error);
            setError('Failed to delete election');
        }
    };

    const handleAddPosition = async (name: string, description: string, electionId: number) => {
        try {
            await axios.post('http://localhost:8000/api/position', {
                name,
                description,
                seats: '8-12', // Example value
                election_id: electionId,
            }, {
                withCredentials: true
            });
            alert('Position added successfully');
        } catch (error) {
            console.error(error);
            setError('Failed to add position');
        }
    };

    const handleDeletePosition = async (id: number) => {
        try {
            await axios.delete(`http://localhost:8000/api/position/${id}`, {
                withCredentials: true
            });
            alert('Position deleted successfully');
        } catch (error) {
            console.error(error);
            setError('Failed to delete position');
        }
    };

    const handleAddApplication = async (content: string, applicantName: string, applicantId: string, positionId: number) => {
        try {
            await axios.post('http://localhost:8000/api/application', {
                content,
                applicant_name: applicantName,
                applicant_id: applicantId,
                position_id: positionId,
            }, {
                withCredentials: true
            });
            alert('Application added successfully');
        } catch (error) {
            console.error(error);
            setError('Failed to add application');
        }
    };

    const handleDeleteApplication = async (id: number) => {
        try {
            await axios.delete(`http://localhost:8000/api/application/${id}`, {
                withCredentials: true
            });
            alert('Application deleted successfully');
        } catch (error) {
            console.error(error);
            setError('Failed to delete application');
        }
    };

    return {
        handleAddElection,
        handleDeleteElection,
        handleAddPosition,
        handleDeletePosition,
        handleAddApplication,
        handleDeleteApplication,
        error,
    };
};

export default useAdminActions;
