import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing'; // Import the Landing Page
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';

function App() {
  const [user, setUser] = useState(null);

  // Restore user from local storage on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      
      <Routes>
        {/* 1. The Public Landing Page (First thing they see) */}
        <Route path="/" element={<Landing />} />

        {/* 2. The Verification Page (Public) */}
        <Route path="/verify/:id" element={<Verify />} />

        {/* 3. The App Portal (Login / Dashboard) */}
        <Route path="/portal" element={
          !user ? (
            <Login setUser={setUser} />
          ) : (
            <Dashboard user={user} setUser={setUser} />
          )
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;