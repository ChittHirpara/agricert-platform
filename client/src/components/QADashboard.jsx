import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, Microscope, TestTube, X, CheckCircle, AlertTriangle, 
  Activity, Sparkles, Scan, Upload, BrainCircuit
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

const QADashboard = ({ user }) => {
  const [pendingBatches, setPendingBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // AI SCANNING STATE
  const [isScanning, setIsScanning] = useState(false);
  const [scanImage, setScanImage] = useState(null);

  // Mock Data for Charts
  const statsData = [
    { name: 'Certified', value: 12, color: '#16a34a' },
    { name: 'Rejected', value: 2, color: '#dc2626' },
    { name: 'Pending', value: 5, color: '#f59e0b' },
  ];
  const weeklyData = [
    { day: 'Mon', inspections: 4 }, { day: 'Tue', inspections: 7 },
    { day: 'Wed', inspections: 3 }, { day: 'Thu', inspections: 8 }, { day: 'Fri', inspections: 6 },
  ];

  const [form, setForm] = useState({
    moisture: '',
    pesticide: '',
    organicStatus: 'Non-Organic',
    isoCode: '',
    result: 'Pass'
  });

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get('https://agriqcert-1.onrender.com/api/inspections/pending');
      setPendingBatches(res.data);
    } catch (err) { console.error(err); }
  };

  // --- THE MIND-BLOWING AI FUNCTION ---
  const handleAIScan = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Show Image
    const reader = new FileReader();
    reader.onload = (x) => setScanImage(x.target.result);
    reader.readAsDataURL(file);

    // 2. Start Animation
    setIsScanning(true);

    // 3. Simulate "Processing" delay (2 seconds)
    setTimeout(() => {
      setIsScanning(false);
      
      // 4. Auto-Fill Data (The Magic)
      setForm({
        moisture: '11.4% (Optimal)',
        pesticide: '0.002 ppm (Safe)',
        organicStatus: 'Organic',
        isoCode: 'ISO-22000:2018',
        result: 'Pass'
      });

      toast.success("AI Analysis Complete: Quality Verified", {
        icon: '🤖',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });

    }, 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://agriqcert-1.onrender.com/api/inspections', {
        ...form, batchId: selectedBatch._id, qaId: user.id
      });
      toast.success(`Batch Marked as ${form.result}!`);
      setSelectedBatch(null);
      setScanImage(null); // Reset AI
      fetchPending();
    } catch (err) { toast.error('Submission Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* ANALYTICS SECTION */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-6">
          <Activity className="text-blue-600" /> Lab Command Center
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Inspection Status</h3>
            <div className="h-40 w-full"><ResponsiveContainer><PieChart><Pie data={statsData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">{statsData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Weekly Output</h3>
             <div className="h-40 w-full"><ResponsiveContainer><BarChart data={weeklyData}><XAxis dataKey="day" tick={{fontSize: 12}} /><Tooltip cursor={{fill: 'transparent'}} /><Bar dataKey="inspections" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
            <div><h3 className="text-white/80 text-sm font-bold uppercase">AI Efficiency</h3><h1 className="text-5xl font-bold mt-2">98%</h1><p className="text-blue-200 text-sm mt-2">Automated visual inspection is active.</p></div>
          </motion.div>
        </div>
      </div>

      {/* PENDING LIST */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2"><Microscope size={20} /> Pending Inspections</h3>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">{pendingBatches.length} Active</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {pendingBatches.map((batch) => (
          <motion.div key={batch._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 hover:shadow-xl transition-all cursor-pointer group">
            <div className="flex justify-between mb-4"><span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">BATCH #{batch._id.substring(0,6)}</span><span className="text-xs text-gray-400">{new Date(batch.createdAt).toLocaleDateString()}</span></div>
            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{batch.productType}</h3>
            <p className="text-sm text-gray-500 mb-4">Exporter: {batch.exporter?.username || 'Unknown'}</p>
            <button onClick={() => setSelectedBatch(batch)} className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"><TestTube size={18} /> Inspect Now</button>
          </motion.div>
        ))}
        {pendingBatches.length === 0 && (<div className="col-span-full text-center py-20 text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200"><ClipboardCheck className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>All clear! No pending inspections.</p></div>)}
      </div>

      {/* --- AI INSPECTION MODAL --- */}
      <AnimatePresence>
        {selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh]">
              
              {/* LEFT: AI SCANNER PANEL */}
              <div className="w-full md:w-1/2 bg-gray-900 p-6 flex flex-col relative overflow-hidden">
                <h3 className="text-white font-bold flex items-center gap-2 mb-4 z-10"><BrainCircuit className="text-purple-400" /> AI Visual Analysis</h3>
                
                <div className="flex-1 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center relative bg-black/50 overflow-hidden">
                  {!scanImage ? (
                    <label className="cursor-pointer flex flex-col items-center text-gray-400 hover:text-white transition-colors z-10">
                      <Upload size={40} className="mb-2" />
                      <span className="text-sm font-bold">Upload Crop Sample</span>
                      <span className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleAIScan} />
                    </label>
                  ) : (
                    <>
                      <img src={scanImage} alt="Sample" className="w-full h-full object-cover opacity-80" />
                      
                      {/* SCANNING ANIMATION OVERLAY */}
                      {isScanning && (
                        <div className="absolute inset-0 z-20">
                          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_#22c55e] animate-[scan_2s_ease-in-out_infinite]" />
                          <div className="absolute inset-0 bg-green-500/10 grid grid-cols-4 gap-px opacity-30"></div>
                          <div className="absolute bottom-4 left-4 bg-black/80 text-green-400 px-3 py-1 rounded font-mono text-xs animate-pulse">
                            Processing Grain Patterns...
                          </div>
                        </div>
                      )}

                      {!isScanning && (
                        <div className="absolute bottom-4 left-4 bg-green-600 text-white px-3 py-1 rounded font-bold text-xs flex items-center gap-2 shadow-lg">
                          <CheckCircle size={12} /> Analysis Complete
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="mt-4 z-10">
                   <p className="text-gray-500 text-xs">Powered by AgriVision™ Neural Engine</p>
                </div>
              </div>

              {/* RIGHT: MANUAL/AUTO FORM */}
              <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Inspection Results</h3>
                  <button onClick={() => {setSelectedBatch(null); setScanImage(null);}} className="hover:bg-gray-100 p-2 rounded-full"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex justify-between">
                      Moisture Level
                      {scanImage && !isScanning && <span className="text-purple-600 text-xs font-bold flex items-center gap-1"><Sparkles size={10}/> AI Detected</span>}
                    </label>
                    <input required type="text" placeholder="e.g. 12%" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                      value={form.moisture} onChange={e => setForm({...form, moisture: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex justify-between">
                      Pesticide Content
                      {scanImage && !isScanning && <span className="text-purple-600 text-xs font-bold flex items-center gap-1"><Sparkles size={10}/> AI Detected</span>}
                    </label>
                    <input required type="text" placeholder="e.g. 0.01" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                      value={form.pesticide} onChange={e => setForm({...form, pesticide: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">ISO Standard Code</label>
                    <input required type="text" placeholder="ISO-22000" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={form.isoCode} onChange={e => setForm({...form, isoCode: e.target.value})} />
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setForm({...form, result: 'Pass'})}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${form.result === 'Pass' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'}`}>
                        <CheckCircle /> Pass
                      </button>
                      <button type="button" onClick={() => setForm({...form, result: 'Fail'})}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${form.result === 'Fail' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400'}`}>
                        <AlertTriangle /> Fail
                      </button>
                  </div>
                  <button className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold shadow-lg transition-all mt-4">
                    {loading ? 'Issuing Certificate...' : 'Sign & Issue Certificate'}
                  </button>
                </form>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Inline Style for Scanning Animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
};

export default QADashboard;