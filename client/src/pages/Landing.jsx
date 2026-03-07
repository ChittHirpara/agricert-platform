import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, Globe, Cpu, Satellite, ArrowRight, CheckCircle, Zap, Lock, ChevronRight } from 'lucide-react';
import { useState } from 'react'; // Add useState
import Documentation from '../components/Documentation'; // Add Import
import { AnimatePresence } from 'framer-motion'; // Ensure this is imported

const Landing = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
const [showDocs, setShowDocs] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden selection:bg-green-500/30">
      
      {/* --- NOISE TEXTURE OVERLAY (Film Grain Effect) --- */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-40 bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 blur-lg opacity-40 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-xl">
                <ShieldCheck size={22} />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-green-400 transition-colors">AgriQCert</span>
          </div>
          <Link to="/portal">
            <button className="group relative px-6 py-2 rounded-full bg-white text-black font-bold text-sm overflow-hidden transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                Access Portal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative h-[110vh] flex items-center justify-center overflow-hidden">
        
        {/* Animated Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-green-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>

        <div className="relative z-10 text-center max-w-5xl px-6 mt-20">
          
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-green-400">v2.0 Live on Mainnet</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-9xl font-bold tracking-tighter mb-8 leading-[0.9]"
          >
            Trust in <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">Every Grain.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            The world's first decentralized supply chain protocol. 
            Powered by <span className="text-white font-bold">AI</span>, secured by <span className="text-white font-bold">Blockchain</span>, and tracked via <span className="text-white font-bold">Satellite</span>.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex flex-col md:flex-row gap-6 justify-center items-center"
          >
            <Link to="/portal">
              <button className="relative px-10 py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:shadow-[0_0_60px_rgba(34,197,94,0.6)] hover:-translate-y-1 group">
                <span className="flex items-center gap-3">
                  <ShieldCheck className="group-hover:rotate-12 transition-transform" /> Launch Platform
                </span>
              </button>
            </Link>
            <button 
  onClick={() => setShowDocs(true)} // <--- ADD THIS
  className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 backdrop-blur-md flex items-center gap-3"
>
  <Zap size={20} className="text-yellow-400" /> View Documentation
</button>
          </motion.div>

        </div>

        {/* Floating Parallax Elements */}
        <motion.div style={{ y: y1 }} className="absolute top-1/4 left-10 opacity-20 hidden md:block">
          <Globe size={300} className="text-blue-500 animate-spin-slow" />
        </motion.div>
        <motion.div style={{ y: y2 }} className="absolute bottom-1/4 right-10 opacity-20 hidden md:block">
          <Cpu size={250} className="text-green-500" />
        </motion.div>
      </div>

      {/* --- INFINITE MARQUEE (Trusted By) --- */}
      <div className="py-10 border-y border-white/5 bg-white/5 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10"></div>
        
        <div className="flex gap-20 animate-[scroll_20s_linear_infinite] min-w-max px-10 opacity-50 grayscale">
          {['GlobalFoods', 'AgriCorp', 'UN Food Program', 'SafeHarvest', 'EcoRice', 'TechFarm', 'GreenChain'].map((logo, i) => (
            <span key={i} className="text-2xl font-bold font-mono tracking-widest">{logo.toUpperCase()}</span>
          ))}
          {['GlobalFoods', 'AgriCorp', 'UN Food Program', 'SafeHarvest', 'EcoRice', 'TechFarm', 'GreenChain'].map((logo, i) => (
            <span key={`dup-${i}`} className="text-2xl font-bold font-mono tracking-widest">{logo.toUpperCase()}</span>
          ))}
        </div>
      </div>

      {/* --- BENTO GRID FEATURES --- */}
      <div className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Beyond Documentation. <br/><span className="text-gray-500">This is Digital Truth.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[800px]">
            
            {/* CARD 1: SATELLITE (Large Left) */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="md:col-span-2 md:row-span-2 bg-[#111] rounded-[40px] border border-white/10 p-10 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-700 group-hover:scale-105 transform"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Satellite className="text-white" size={32} />
                </div>
                <h3 className="text-4xl font-bold mb-4">Live Satellite Telemetry</h3>
                <p className="text-gray-300 text-lg max-w-md">
                  Don't just track status. Track reality. Our system taps into IoT sensors and GPS satellites to monitor temperature, humidity, and location in real-time.
                </p>
              </div>
            </motion.div>

            {/* CARD 2: AI (Top Right) */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-[#111] rounded-[40px] border border-white/10 p-8 relative overflow-hidden group hover:border-purple-500/50 transition-colors"
            >
              <div className="absolute top-0 right-0 p-32 bg-purple-600/20 blur-[80px] group-hover:bg-purple-600/30 transition-all"></div>
              <Cpu size={40} className="text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Neural Engine AI</h3>
              <p className="text-gray-400 text-sm">Computer vision algorithms analyze crop quality instantly from photos.</p>
            </motion.div>

            {/* CARD 3: BLOCKCHAIN (Bottom Right) */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="bg-[#111] rounded-[40px] border border-white/10 p-8 relative overflow-hidden group hover:border-green-500/50 transition-colors"
            >
              <div className="absolute top-0 right-0 p-32 bg-green-600/20 blur-[80px] group-hover:bg-green-600/30 transition-all"></div>
              <Lock size={40} className="text-green-400 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Cryptographic Ledger</h3>
              <p className="text-gray-400 text-sm">SHA-256 Hashing ensures data immutability. Verified by Matrix Audit Protocol.</p>
            </motion.div>

          </div>
        </div>
      </div>

      {/* --- CTA FOOTER --- */}
      <div className="py-40 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
           <h2 className="text-5xl md:text-8xl font-bold mb-10 tracking-tight">Ready to <br/>revolutionize trade?</h2>
           <Link to="/portal">
              <button className="group relative px-12 py-6 bg-white text-black rounded-full font-bold text-xl overflow-hidden transition-transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-emerald-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center gap-3">
                  Enter The Portal <ChevronRight />
                </span>
              </button>
           </Link>
           <p className="mt-12 text-gray-600 font-mono text-sm">© 2025 AGRIQCERT PROTOCOL. SECURED BY ETHEREUM.</p>
        </div>
      </div>

      {/* CSS for Animations */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
{/* DOCUMENTATION MODAL */}
<AnimatePresence>
  {showDocs && <Documentation onClose={() => setShowDocs(false)} />}
</AnimatePresence>
    </div>
  );
};



export default Landing;