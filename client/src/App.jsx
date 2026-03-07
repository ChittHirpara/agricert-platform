import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing'; // Import the Landing Page
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';

// --- NEW HACKATHON COMPONENTS ---
import CertifierDashboard from './pages/CertifierDashboard';
import ConsumerVerification from './pages/ConsumerVerification';
import Auction from './components/Auction';
import ChatbotWidget from './components/ChatbotWidget';
import RoleSwitcher from './components/RoleSwitcher';

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

        {/* 2. The Verification Page (Existing Public) */}
        <Route path="/verify/:id" element={<Verify />} />

        {/* --- NEW HACKATHON Consumer Verification Page --- */}
        <Route path="/consumer-verify" element={<ConsumerVerification />} />

        {/* --- NEW HACKATHON Certifier Dashboard --- */}
        <Route path="/portal/certifier" element={
          !user ? <Navigate to="/portal" /> : <CertifierDashboard />
        } />

        {/* --- LIVE AUCTION WEB-SOCKET ROOM --- */}
        <Route path="/auction/:batchId" element={
          !user ? <Navigate to="/portal" /> : <Auction user={user} />
        } />

        {/* 3. The App Portal (Login / Dashboard) */}
        <Route path="/portal" element={
          !user ? (
            <Login setUser={setUser} />
          ) : (
            <Dashboard user={user} setUser={setUser} />
          )
        } />

      </Routes>

      {/* --- NEW HACKATHON GLOBAL COMPONENTS --- */}
      <ChatbotWidget />
      <RoleSwitcher user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

export default App;