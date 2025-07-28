

import React from 'react';
import { useState, useEffect, FormEvent } from 'react';


declare global {
  interface Window {
    t3: {
      getAppName: () => Promise<string>;

      login: (apiKey: string) => Promise<any | null>;
    };
  }
}



const LoginPage = ({ onLoginSuccess, onLoginFail }) => {
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

const DashboardPage = ({ employee, onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const intervalRef = React.useRef(null);

  useEffect(() => {
    window.t3.getProjects(employee.id)
      .then(fetchedProjects => {
        console.log('Fetched projects:', fetchedProjects);
        setProjects(fetchedProjects);

        if (fetchedProjects.length > 0 && fetchedProjects[0].tasks.length > 0) {
          setSelectedTaskId(fetchedProjects[0].tasks[0].id);
        }
        setIsLoading(false);
      });
  }, [employee.id]);

  const startClock = () => {
    setElapsedSeconds(0);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopClock = () => {
    clearInterval(intervalRef.current);
  };
  const handleStartStopClick = async () => {
    if (isTimerRunning) {
      // Logic to STOP the timer
      const result = await window.t3.stopTimer(employee.id);
      if (result) {
        setIsTimerRunning(false);
        stopClock();
      }
    } else {
      // Logic to START the timer
      if (!selectedTaskId) {
        alert('Please select a project to track time against.');
        return;
      }
      const result = await window.t3.startTimer(employee.id, selectedTaskId);
      if (result) {
        setIsTimerRunning(true);
        startClock();
      }
    }
  };


  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  if (isLoading) {
    return <p>Loading projects...</p>;
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
            // Assuming 1:1 project to task mapping for now
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




function App() {

  const [employee, setEmployee] = useState(null);

  const handleLoginSuccess = (employeeData) => {
    setEmployee(employeeData);
  };

  const handleLogout = () => {
    setEmployee(null);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">

      {employee ? (
        <DashboardPage employee={employee} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} onLoginFail={() => { }} />
      )}
    </div>
  );
}
export default App;