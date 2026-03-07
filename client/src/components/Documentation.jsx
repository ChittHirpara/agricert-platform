import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Server, Database, Globe, ShieldCheck, Cpu, Smartphone, Code, Layers, Play, FileText, Video } from 'lucide-react';

const Documentation = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('blueprint'); // 'blueprint' or 'video'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-hidden">
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        className="w-full max-w-6xl h-[85vh] bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        
        {/* GRID BACKGROUND */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

        {/* HEADER & TABS */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f0f0f] z-10">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/50">
                <Layers className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Project Documentation</h2>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">AgriQCert Protocol v2.0</p>
              </div>
            </div>

            {/* TAB SWITCHER */}
            <div className="hidden md:flex bg-white/5 p-1 rounded-lg border border-white/5">
              <button 
                onClick={() => setActiveTab('blueprint')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  activeTab === 'blueprint' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText size={16} /> System Blueprint
              </button>
              <button 
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  activeTab === 'video' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Video size={16} /> Watch Demo
              </button>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar z-10">
          
          {/* === TAB 1: BLUEPRINT === */}
          {activeTab === 'blueprint' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-10">Data Flow Architecture</h3>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative">
                  <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-blue-900 via-green-500 to-purple-900 -z-10"></div>
                  <TechNode icon={Smartphone} title="Frontend Client" desc="React + Vite + Tailwind" color="text-blue-400" border="border-blue-500/30" />
                  <TechNode icon={Server} title="API Gateway" desc="Node.js + Express" color="text-gray-400" border="border-white/20" />
                  <TechNode icon={Cpu} title="AI Engine" desc="Computer Vision Analysis" color="text-purple-400" border="border-purple-500/30" />
                  <TechNode icon={Database} title="Data Layer" desc="MongoDB Cluster" color="text-green-400" border="border-green-500/30" />
                  <TechNode icon={ShieldCheck} title="Blockchain" desc="SHA-256 Ledger" color="text-yellow-400" border="border-yellow-500/30" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoCard icon={Cpu} title="Artificial Intelligence" color="text-purple-500" desc="Custom CNN model for grain analysis, detecting moisture and impurities via image processing." />
                <InfoCard icon={ShieldCheck} title="Cryptographic Security" color="text-green-500" desc="SHA-256 hashing ensures data immutability. Every transaction is cryptographically signed." />
                <InfoCard icon={Globe} title="Satellite Telemetry" color="text-blue-500" desc="Real-time Google Maps integration simulating IoT sensor data for temperature and location tracking." />
                <InfoCard icon={Code} title="RESTful Architecture" color="text-yellow-500" desc="Robust Node.js backend handling multipart file uploads, JWT authentication, and order logic." />
              </div>
            </motion.div>
          )}

          {/* === TAB 2: VIDEO DEMO === */}
          {activeTab === 'video' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full">
              <div className="w-full max-w-4xl bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative group">
                
                {/* Video Player */}
                <video 
                  controls 
                  className="w-full aspect-video object-cover"
                  poster="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" // Placeholder thumbnail
                >
                  <source src="/demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Overlay Title */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 pointer-events-none">
                  <p className="text-white font-bold text-sm flex items-center gap-2">
                    <Play size={14} className="text-green-500 fill-green-500" /> Live Project Demo
                  </p>
                </div>

              </div>
              
              <div className="mt-8 text-center max-w-2xl">
                <h3 className="text-xl font-bold text-white mb-2">Walkthrough of AgriQCert</h3>
                <p className="text-gray-400">
                  Watch the full workflow: from Exporter submission, to AI-powered Quality Inspection, to Blockchain Verification.
                </p>
              </div>
            </motion.div>
          )}

        </div>

      </motion.div>
    </div>
  );
};

// Helper Components
const TechNode = ({ icon: Icon, title, desc, color, border }) => (
  <motion.div whileHover={{ scale: 1.05, y: -5 }} className={`bg-[#1a1a1a] p-6 rounded-2xl border ${border} w-48 flex flex-col items-center text-center shadow-2xl z-10`}>
    <div className={`mb-3 ${color}`}><Icon size={32} /></div>
    <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
    <p className="text-xs text-gray-500">{desc}</p>
  </motion.div>
);

const InfoCard = ({ icon: Icon, title, desc, color }) => (
  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Icon className={color} /> {title}</h4>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Documentation;