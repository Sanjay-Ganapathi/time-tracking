import React from 'react';
import { useState, useEffect, FormEvent } from 'react';


declare global {
  interface Window {
    t3: {

      getAppName: () => Promise<string>;
      login: (apiKey: string) => Promise<any | null>;


      getProjects: (employeeId: string) => Promise<any[]>;
      startTimer: (employeeId: string, taskId: string) => Promise<any | null>;
      stopTimer: (employeeId: string) => Promise<any | null>;

      getScreenId: () => Promise<string | null>;
      captureScreen: (sourceId: string) => Promise<string>;
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
  const [activeTimeEntryId, setActiveTimeEntryId] = useState(null);

  const intervalRef = React.useRef(null);
  const screenshotIntervalRef = React.useRef(null);

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

  const startClock = () => {
    setElapsedSeconds(0);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopClock = () => {
    clearInterval(intervalRef.current);
  };


  const takeAndUploadScreenshot = async (currentAactiveTimeEntryId) => {
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
          timeEntryId: currentAactiveTimeEntryId,
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
      const result = await window.t3.stopTimer(employee.id);
      if (result) {
        setIsTimerRunning(false);
        stopClock();

        clearInterval(screenshotIntervalRef.current);
        setActiveTimeEntryId(null);
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


        takeAndUploadScreenshot(result.id);

        screenshotIntervalRef.current = setInterval(() => {
          takeAndUploadScreenshot(result.id);
        }, 60000);
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