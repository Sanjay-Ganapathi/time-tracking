import { useState, useEffect } from 'react';

type Status = 'idle' | 'activating' | 'success' | 'error';

function App() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const activationToken = urlParams.get('token');

    if (activationToken) {
      setToken(activationToken);
    } else {
      setStatus('error');
      setError('No activation token found in URL. Please use the link from your email.');
    }
  }, []);

  const handleActivation = async () => {
    if (!token) return;

    setStatus('activating');
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/employees/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to activate account.');
      }

      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <>
            <h1 className="text-3xl font-bold text-green-400 mb-4">Account Activated!</h1>
            <p className="text-gray-300 mb-8">You can now download the local application and log in with your API key.</p>
            <a
              href="#" //this would link to the packaged Electron app 
              className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
            >
              Download T3 App
            </a>
          </>
        );
      case 'error':
        return (
          <>
            <h1 className="text-3xl font-bold text-red-500 mb-4">Activation Failed</h1>
            <p className="text-gray-300">{error}</p>
          </>
        );
      case 'activating':
        return <p className="text-gray-300">Activating your account...</p>;
      case 'idle':
        return (
          <>
            <h1 className="text-3xl font-bold text-white mb-4">Welcome to T3</h1>
            <p className="text-gray-300 mb-8">Click the button below to activate your account.</p>
            <button
              onClick={handleActivation}
              className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
            >
              Activate My Account
            </button>
          </>
        );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center p-10 max-w-lg mx-auto bg-gray-800 rounded-lg shadow-xl">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;