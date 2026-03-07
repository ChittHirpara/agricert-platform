import QADashboard from '../components/QADashboard';
import { LogOut } from 'lucide-react';
import ExporterDashboard from '../components/ExporterDashboard';
import ImporterDashboard from '../components/ImporterDashboard';

const Dashboard = ({ user, setUser }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">AgriQCert <span className="text-gray-400 font-normal">Portal</span></h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800">{user.username}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{user.role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Render Dashboard based on Role */}
        {user.role === 'exporter' && <ExporterDashboard user={user} />}
        {user.role === 'qa' && <QADashboard user={user} />}
        {user.role === 'admin' && <div className="text-center py-20">Admin Dashboard Coming Soon...</div>}
        {/* Importer View */}
{user.role === 'importer' && <ImporterDashboard user={user} />}
      </main>
    </div>
  );
};

export default Dashboard;