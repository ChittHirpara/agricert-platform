import { LogOut, Layout } from 'lucide-react';
import FarmerDashboard from './FarmerDashboard';
import CertifierDashboard from './CertifierDashboard';
import AuctionMarketplace from './AuctionMarketplace';
import ConsumerVerification from './ConsumerVerification';

const Dashboard = ({ user, setUser }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#030603] selection:bg-emerald-500/30">
      {/* Premium Dark Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#030603]/80 backdrop-blur-2xl border-b border-white/5 py-3 px-6">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img src="/veridant-logo.png" alt="AgriCert" className="relative w-8 h-8 object-contain rounded-lg" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black text-white tracking-widest italic leading-none">Agri<span className="text-emerald-400">Cert</span></h1>
              <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-emerald-500/60 font-bold">Secure Network</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:flex flex-col items-end">
              <p className="text-xs font-black text-white uppercase tracking-wider">{user.name}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[9px] text-emerald-500/80 font-mono uppercase tracking-widest font-bold">{user.role}</span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

            <button
              onClick={handleLogout}
              className="group relative p-2.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/40 rounded-xl transition-all duration-300"
              title="Logout"
            >
              <LogOut size={18} className="text-gray-400 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative pt-10">
        <div className="max-w-[1440px] mx-auto">
          {/* Render Dashboard based on Hackathon Role Map */}
          {user.role === 'farmer' && <FarmerDashboard user={user} />}
          {user.role === 'certifier' && <CertifierDashboard user={user} />}
          {user.role === 'distributor' && <AuctionMarketplace user={user} />}
          {user.role === 'consumer' && <ConsumerVerification />}
          {user.role === 'admin' && <div className="text-center py-40 text-emerald-500 font-mono tracking-widest uppercase">Admin Terminal Initializing...</div>}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
