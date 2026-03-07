import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, CheckCircle, XCircle, Loader2, 
  Package, MapPin, Tractor, Microscope, Ship, Lock 
} from 'lucide-react';
import BlockchainAudit from '../components/BlockchainAudit'; // Import the Matrix Component

const Verify = () => {
  const { id } = useParams();
  
  // --- STATE VARIABLES ---
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAudit, setShowAudit] = useState(false); // <--- State for Matrix Modal

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const res = await axios.get(`https://agriqcert-1.onrender.com/api/batches/verify/${id}`);
        setBatch(res.data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBatch();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-green-600">
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <p className="font-semibold animate-pulse">Verifying Blockchain Credentials...</p>
    </div>
  );

  if (error || !batch) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border-t-4 border-red-500">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Invalid Credential</h1>
        <p className="text-gray-500 mt-2">This QR code is invalid or the batch does not exist in the registry.</p>
      </div>
    </div>
  );

  // Timeline Events Data
  const timelineEvents = [
    {
      title: "Harvested & Registered",
      date: new Date(batch.createdAt).toLocaleDateString(),
      desc: `Sourced from ${batch.location}`,
      icon: <Tractor size={20} />,
      color: "bg-yellow-500"
    },
    {
      title: "Quality Inspection",
      date: new Date(batch.updatedAt || batch.createdAt).toLocaleDateString(),
      desc: "Passed Lab Analysis (Moisture, Pesticide)",
      icon: <Microscope size={20} />,
      color: "bg-blue-500"
    },
    {
      title: "Digitally Certified",
      date: new Date().toLocaleDateString(),
      desc: "Passport Issued by AgriQCert Authority",
      icon: <ShieldCheck size={20} />,
      color: "bg-green-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: The Certificate Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-10">
            <div className={`p-8 text-center ${batch.status === 'Certified' ? 'bg-green-600' : 'bg-yellow-500'}`}>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                {batch.status === 'Certified' ? <ShieldCheck className="w-10 h-10 text-white" /> : <Package className="w-10 h-10 text-white" />}
              </div>
              <h1 className="text-xl font-bold text-white tracking-wide uppercase">{batch.status}</h1>
              <p className="text-white/80 text-xs mt-1">Immutable Record</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800">{batch.productType}</h2>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">ID: {batch._id}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-3 border border-gray-100">
                <div className="flex items-center gap-3">
                  <Package className="text-green-500 w-4 h-4" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Quantity</p>
                    <p className="font-semibold">{batch.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-blue-500 w-4 h-4" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Origin</p>
                    <p className="font-semibold">{batch.location}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 bg-green-50 text-green-700 p-3 rounded-xl border border-green-100">
                 <CheckCircle size={16} />
                 <span className="font-bold text-xs">Verified Valid</span>
              </div>

              {/* --- THE AUDIT BUTTON --- */}
              <button 
                onClick={() => setShowAudit(true)}
                className="w-full py-3 bg-gray-900 text-green-400 border border-green-500/30 rounded-xl text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
              >
                <Lock size={14} /> Audit Blockchain Ledger
              </button>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Supply Chain Timeline */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
             <Ship className="text-blue-600" /> Supply Chain Journey
          </h2>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {timelineEvents.map((event, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${event.color} text-white`}>
                  {event.icon}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-slate-900">{event.title}</div>
                    <time className="font-mono text-xs font-medium text-slate-500">{event.date}</time>
                  </div>
                  <div className="text-slate-500 text-sm">{event.desc}</div>
                </div>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-200 shadow shrink-0 md:mx-auto">
               <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
            </motion.div>
          </div>
        </div>

      </div>

      {/* --- THE MATRIX POPUP --- */}
      {showAudit && (
        <BlockchainAudit batch={batch} onClose={() => setShowAudit(false)} />
      )}

    </div>
  );
};

export default Verify;