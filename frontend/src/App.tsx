

import { useState } from 'react';
import { LoginPage } from './components/login-page';
import { DashboardPage } from './components/dashboard-page';
import { Employee, Project } from './types/types';


declare global {
  interface Window {
    t3: {
      getAppName: () => Promise<string>;
      login: (apiKey: string) => Promise<Employee | null>;
      getProjects: (employeeId: string) => Promise<Project[]>;
      startTimer: (employeeId: string, taskId: string) => Promise<{ id: string } | null>;
      stopTimer: (employeeId: string) => Promise<any | null>;
      getScreenId: () => Promise<string | null>;
      captureScreen: (sourceId: string) => Promise<string>;
    };
  }
}

function App() {

  const [employee, setEmployee] = useState<Employee | null>(null);

  const handleLoginSuccess = (employeeData: Employee) => {
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