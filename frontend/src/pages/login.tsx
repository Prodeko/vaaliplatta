import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router';

const Login = () => {
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<AuthError | null>(null);
    const { login } = useAuth()

    // Logic to redirect user back to the page they were trying to access
    // before being redirected to the login page
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from: { pathname: string } })?.from?.pathname || '/';

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError(null);
        const result = await login(password)
        if (result.ok) navigate(from, { replace: true }) // redirect
        else setError(result.error)
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-blue-900">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">
                    Prodeko Vaaliplatta admin panel
                </h1>
                <p className="text-center text-gray-600 mb-8">
                    Please log in to continue
                </p>

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter the admin token"
                            className="w-full px-4 py-2 border border-gray-300 rounded"
                            required
                        />
                    </div>

                    {error && (
                        <div className="mb-4 text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Log in with token
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
