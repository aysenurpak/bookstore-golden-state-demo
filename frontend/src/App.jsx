import React, { useState, useEffect } from 'react';
import Login from './Login';
import AdminPanel from './AdminPanel';
import CustomerPanel from './CustomerPanel';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = JSON.parse(atob(token.split('.')[1]));
        setUser(userData);
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : user.role === 'admin' ? (
        <AdminPanel user={user} onLogout={handleLogout} />
      ) : (
        <CustomerPanel user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;