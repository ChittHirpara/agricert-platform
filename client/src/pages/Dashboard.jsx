import { useState, useEffect } from 'react';
import { LogOut, Leaf, Shield, ChevronRight, Bell, Settings } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FarmerDashboard from './FarmerDashboard';
import CertifierDashboard from './CertifierDashboard';
import AuctionMarketplace from './AuctionMarketplace';
import ConsumerVerification from './ConsumerVerification';

const ROLE_META = {
  farmer: { label: 'Farmer', color: 'rgba(132,177,121,1)', bg: 'rgba(132,177,121,0.1)', border: 'rgba(132,177,121,0.25)', emoji: '🌾' },
  certifier: { label: 'Certifier', color: 'rgba(147,197,253,1)', bg: 'rgba(147,197,253,0.08)', border: 'rgba(147,197,253,0.2)', emoji: '🔬' },
  distributor: { label: 'Distributor', color: 'rgba(252,211,77,1)', bg: 'rgba(252,211,77,0.08)', border: 'rgba(252,211,77,0.2)', emoji: '🏛️' },
  consumer: { label: 'Consumer', color: 'rgba(196,181,253,1)', bg: 'rgba(196,181,253,0.08)', border: 'rgba(196,181,253,0.2)', emoji: '🔍' },
  admin: { label: 'Admin', color: 'rgba(248,113,113,1)', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', emoji: '⚙️' },
};

const Dashboard = ({ user, setUser }) => {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 40], ['rgba(6,12,5,0.7)', 'rgba(6,12,5,0.97)']);
  const roleMeta = ROLE_META[user?.role] || ROLE_META.consumer;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#060c05] selection:bg-sage-600/25">

      {/* Premium Navbar */}
      <motion.nav style={{ background: navBg }}
        className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-2xl border-b border-white/[0.05]">
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 rounded-lg blur-lg opacity-25 group-hover:opacity-50 transition-opacity"
                style={{ background: 'rgba(132,177,121,0.6)' }} />
              <div className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-sage-600/15 border border-sage-600/25">
                <Leaf size={17} className="text-sage-500" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight leading-none">
                Agri<span className="text-sage-400">Cert</span>
              </h1>
              <p className="text-[8px] font-mono uppercase tracking-[0.35em] text-sage-600 leading-none mt-0.5">Secure Network</p>
            </div>
          </div>

          {/* Center: role breadcrumb */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border"
            style={{ background: roleMeta.bg, borderColor: roleMeta.border }}>
            <span className="text-sm">{roleMeta.emoji}</span>
            <ChevronRight size={12} style={{ color: roleMeta.color, opacity: 0.6 }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: roleMeta.color }}>
              {roleMeta.label} Dashboard
            </span>
          </div>

          {/* Right: user + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-xs font-bold text-white leading-none">{user.name}</p>
              <p className="text-[9px] font-mono uppercase tracking-widest mt-0.5" style={{ color: roleMeta.color, opacity: 0.8 }}>
                {user.email}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border"
              style={{ background: roleMeta.bg, borderColor: roleMeta.border, color: roleMeta.color }}>
              {(user.name || user.role)[0].toUpperCase()}
            </div>
            <div className="w-px h-6 bg-white/[0.08]" />
            <button
              onClick={handleLogout}
              className="group p-2.5 bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.08] hover:border-red-500/30 rounded-xl transition-all duration-300"
              title="Logout"
            >
              <LogOut size={15} className="text-gray-500 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Content */}
      <main className="pt-16">
        <div className="max-w-[1440px] mx-auto">
          {user.role === 'farmer' && <FarmerDashboard user={user} />}
          {user.role === 'certifier' && <CertifierDashboard user={user} />}
          {user.role === 'distributor' && <AuctionMarketplace user={user} />}
          {user.role === 'consumer' && <ConsumerVerification />}
          {user.role === 'admin' && (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
              <div className="w-16 h-16 rounded-2xl bg-sage-600/10 border border-sage-600/20 flex items-center justify-center">
                <Shield size={28} className="text-sage-500" />
              </div>
              <p className="text-sage-500 font-mono text-sm tracking-widest uppercase">Admin Terminal Initializing...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
