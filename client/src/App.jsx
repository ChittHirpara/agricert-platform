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
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#080f07',
            color: '#e5e7eb',
            border: '1px solid rgba(132,177,121,0.2)',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#84B179', secondary: '#080f07' },
            style: { borderColor: 'rgba(132,177,121,0.3)' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#080f07' },
            style: { borderColor: 'rgba(248,113,113,0.3)' },
          },
        }}
      />

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
    </BrowserRouter>
  );
}

export default App;