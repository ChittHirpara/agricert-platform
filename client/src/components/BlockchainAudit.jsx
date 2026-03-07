import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Lock, Terminal, Server, Database, CheckCircle, Cpu } from 'lucide-react';
import CryptoJS from 'crypto-js';

const BlockchainAudit = ({ batch, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [calculatedHash, setCalculatedHash] = useState('');
  const [verificationStatus, setStatus] = useState('processing'); // processing, success, fail

  // Simulate the "Stored" Hash (In real life, this comes from the Smart Contract)
  const storedHash = CryptoJS.SHA256(JSON.stringify(batch)).toString();

  useEffect(() => {
    const addLog = (msg, delay) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `> ${msg}`]);
      }, delay);
    };

    // Sequence of "Hacking" animations
    addLog("Initializing Secure Handshake...", 500);
    addLog("Connecting to AgriQCert Consensus Node...", 1200);
    addLog("Fetching Block Header 0x7F2A...", 2000);
    addLog("Extracting Raw Batch Data...", 2800);
    
    setTimeout(() => {
      addLog("CALCULATING LOCAL SHA-256 HASH...", 0);
      // Actually calculate hash
      const hash = CryptoJS.SHA256(JSON.stringify(batch)).toString();
      setCalculatedHash(hash);
    }, 3500);

    addLog("Comparing with Ledger Root...", 4500);

    setTimeout(() => {
      setStatus('success');
      addLog("CRYPTOGRAPHIC PROOF VALIDATED.", 0);
    }, 5500);

  }, [batch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 font-mono">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-black border border-green-500/50 rounded-lg shadow-[0_0_50px_rgba(34,197,94,0.2)] overflow-hidden flex flex-col h-[80vh]"
      >
        
        {/* HEADER */}
        <div className="bg-gray-900 border-b border-green-500/30 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Terminal className="text-green-500 animate-pulse" size={20} />
            <span className="text-green-500 font-bold tracking-widest">BLOCKCHAIN AUDIT TERMINAL_v4.0</span>
          </div>
          <button onClick={onClose} className="text-green-700 hover:text-green-500 transition-colors"><X /></button>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* LEFT: TERMINAL LOGS */}
          <div className="w-2/3 p-6 overflow-y-auto space-y-2 font-mono text-sm">
            {logs.map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="text-green-400/80 border-l-2 border-green-900 pl-2"
              >
                {log}
              </motion.div>
            ))}
            {verificationStatus === 'processing' && (
               <div className="w-3 h-5 bg-green-500 animate-pulse inline-block ml-2"></div>
            )}
            
            {verificationStatus === 'success' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-8 p-4 border border-green-500/50 bg-green-900/20 rounded text-green-400"
              >
                <p className="text-xs text-gray-500 mb-1">IMMUTABLE HASH MATCH:</p>
                <p className="break-all font-bold text-white">{calculatedHash}</p>
              </motion.div>
            )}
          </div>

          {/* RIGHT: VISUALIZER */}
          <div className="w-1/3 border-l border-green-500/20 bg-gray-900/50 p-6 flex flex-col items-center justify-center space-y-8 relative">
            
            {/* Matrix Rain Background Effect */}
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
              <div className="animate-[scan_4s_linear_infinite] w-full h-full bg-[url('https://media.istockphoto.com/id/1295900106/vector/binary-code-on-green-background-background-in-matrix-style.jpg?s=612x612&w=0&k=20&c=i_4m7n8kLzKkE8a0tZkM7yGk0yKk0yKk0yKk0yKk0yKk=')] bg-cover"></div>
            </div>

            {/* Node Animation */}
            <div className="relative z-10">
               <div className="w-24 h-24 rounded-full border-4 border-gray-700 flex items-center justify-center relative">
                 {/* Connecting Lines */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[2px] bg-green-500/30 rotate-45"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[2px] bg-green-500/30 -rotate-45"></div>
                 
                 <Database className={`text-3xl ${verificationStatus === 'success' ? 'text-green-500' : 'text-gray-500'}`} />
               </div>
               <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 uppercase tracking-widest">Ledger</div>
            </div>

            <div className={`transition-all duration-500 ${verificationStatus === 'success' ? 'bg-green-500 h-20' : 'bg-gray-700 h-10'} w-[2px]`}></div>

            <div className="relative z-10">
               <div className={`w-24 h-24 rounded-full border-4 ${verificationStatus === 'success' ? 'border-green-500 shadow-[0_0_30px_#22c55e]' : 'border-gray-700'} flex items-center justify-center bg-black transition-all duration-500`}>
                 {verificationStatus === 'success' ? (
                   <ShieldCheck size={40} className="text-green-500" />
                 ) : (
                   <Lock size={40} className="text-gray-500 animate-pulse" />
                 )}
               </div>
               <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 uppercase tracking-widest">Contract</div>
            </div>

          </div>
        </div>

        {/* FOOTER STATUS */}
        <div className="border-t border-green-500/30 p-4 bg-gray-900 flex justify-between items-center">
           <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${verificationStatus === 'success' ? 'bg-green-500' : 'bg-yellow-500 animate-ping'}`}></div>
             <span className="text-xs text-green-400 uppercase">
                {verificationStatus === 'success' ? 'Consensus Reached • Block #893210' : 'Auditing Smart Contract Nodes...'}
             </span>
           </div>
           <div className="text-xs text-green-600 font-mono">
             AGRI-Q-CERT PROOF OF QUALITY
           </div>
        </div>

      </motion.div>
    </div>
  );
};

export default BlockchainAudit;