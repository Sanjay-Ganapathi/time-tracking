

import React, { useState, useEffect } from 'react';
import { Employee, Project } from '../types/types';


interface DashboardPageProps {
    employee: Employee;
    onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ employee, onLogout }) => {

    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [activeTimeEntryId, setActiveTimeEntryId] = useState<string | null>(null);


    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
    const screenshotIntervalRef = React.useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        window.t3.getProjects(employee.id)
            .then(fetchedProjects => {
                setProjects(fetchedProjects);
                if (fetchedProjects.length > 0 && fetchedProjects[0].tasks.length > 0) {
                    setSelectedTaskId(fetchedProjects[0].tasks[0].id);
                }
                setIsLoading(false);
            });
    }, [employee.id]);

    useEffect(() => {

        if (isTimerRunning && activeTimeEntryId) {



            takeAndUploadScreenshot();

            screenshotIntervalRef.current = setInterval(() => {
                takeAndUploadScreenshot();
            }, 10000);
        }


        return () => {
            if (screenshotIntervalRef.current) {
                clearInterval(screenshotIntervalRef.current);
            }
        };
    }, [isTimerRunning, activeTimeEntryId]);


    const startClock = () => {
        setElapsedSeconds(0);
        intervalRef.current = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
    };

    const stopClock = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };


    const takeAndUploadScreenshot = async () => {
        if (!activeTimeEntryId) {
            console.error("Cannot take screenshot, no active time entry ID.");
            return;
        }

        let permissionFlag = true;
        let imageBase64 = '';

        try {
            const sourceId = await window.t3.getScreenId();
            if (sourceId) {
                imageBase64 = await window.t3.captureScreen(sourceId);
            } else {
                permissionFlag = false;
            }
        } catch (error) {
            console.error('Screenshot capture failed:', error);
            permissionFlag = false;
        }

        try {
            await fetch('http://localhost:3000/api/screenshots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timeEntryId: activeTimeEntryId,
                    imageBase64,
                    permissionFlag,
                }),
            });
        } catch (error) {
            console.error('Failed to upload screenshot:', error);
        }
    };

    const handleStartStopClick = async () => {
        if (isTimerRunning) {
            // Stop the timer
            const result = await window.t3.stopTimer(employee.id);
            if (result) {
                setIsTimerRunning(false);
                setActiveTimeEntryId(null);
                stopClock();

            }
        } else {

            if (!selectedTaskId) {
                alert('Please select a project to track time against.');
                return;
            }
            const result = await window.t3.startTimer(employee.id, selectedTaskId);
            if (result) {

                setActiveTimeEntryId(result.id);
                setIsTimerRunning(true);
                startClock();
            }
        }
    };


    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    if (isLoading) {
        return <p className="text-white">Loading projects...</p>;
    }


    return (
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-white">Welcome, {employee.name}</h1>
                <button onClick={onLogout} className="text-sm text-cyan-400 hover:text-cyan-200">Logout</button>
            </div>

            <div className="mb-4">
                <label htmlFor="project" className="block text-sm font-medium text-gray-300 mb-1">Project / Task</label>
                <select
                    id="project"
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    disabled={isTimerRunning}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                >
                    {projects.map(project => (
                        project.tasks.length > 0 &&
                        <option key={project.tasks[0].id} value={project.tasks[0].id}>
                            {project.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="text-center p-6 bg-gray-900 rounded-lg mb-6">
                <p className="text-5xl font-mono text-white tracking-widest">{formatTime(elapsedSeconds)}</p>
            </div>

            <button
                onClick={handleStartStopClick}
                className={`w-full text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors ${isTimerRunning
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                    }`}
            >
                {isTimerRunning ? 'Stop Tracking' : 'Start Tracking'}
            </button>
        </div>
    );
};