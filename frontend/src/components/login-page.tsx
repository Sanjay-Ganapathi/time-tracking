

import React, { useState, FormEvent } from 'react';
import { Employee } from '../types/types';


interface LoginPageProps {
    onLoginSuccess: (employee: Employee) => void;
    onLoginFail: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onLoginFail }) => {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!apiKey) {
            setError('API Key cannot be empty.');
            return;
        }


        const employeeData = await window.t3.login(apiKey);

        if (employeeData) {
            onLoginSuccess(employeeData);
        } else {
            setError('Invalid API Key. Please check and try again.');
            onLoginFail();
        }
    };

    return (
        <div className="w-full max-w-xs">
            <form onSubmit={handleSubmit} className="bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="apikey">
                        Your API Key
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline"
                        id="apikey"
                        type="password"
                        placeholder="******************"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                <div className="flex items-center justify-between">
                    <button
                        className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Sign In
                    </button>
                </div>
            </form>
        </div>
    );
};