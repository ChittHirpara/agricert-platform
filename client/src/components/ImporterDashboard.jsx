import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, MapPin, ShieldCheck, Package, Globe, Truck, Trash2, Loader2, TrendingUp, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import DigitalPassport from './DigitalPassport';
import MarketAnalysis from './MarketAnalysis'; // Import the new component

const ImporterDashboard = ({ user }) => {
  const [marketBatches, setMarketBatches] = useState([]);
  const [viewCertificate, setViewCertificate] = useState(null);
  const [viewAnalysis, setViewAnalysis] = useState(null); // State for Analysis Modal

  useEffect(() => {
    fetchMarket();
  }, []);

  const fetchMarket = async () => {
    try {
      const res = await axios.get('https://agriqcert-1.onrender.com/api/batches/market/all');
      setMarketBatches(res.data);
    } catch (err) { console.error(err); }
  };

  const handleRemove = (id) => {
    if(!window.confirm("Hide this item?")) return;
    setMarketBatches(marketBatches.filter(b => b._id !== id));
    toast.success("Item hidden");
  };

  const handleBuy = async (batch) => {
    try {
      await axios.put(`https://agriqcert-1.onrender.com/api/batches/order/${batch._id}`, { buyerId: user.id });
      toast.success(`Order Request Sent for ${batch.productType}!`);
      fetchMarket(); 
    } catch (err) { toast.error("Failed to place order"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- 1. LIVE TICKER TAPE --- */}
      <div className="bg-gray-900 text-white py-2 overflow-hidden whitespace-nowrap border-b border-gray-800">
        <div className="animate-[scroll_30s_linear_infinite] inline-block">
          <span className="mx-6 text-sm font-mono text-green-400">RICE: $450 ▲ 2.3%</span>
          <span className="mx-6 text-sm font-mono text-red-400">WHEAT: $320 ▼ 0.5%</span>
          <span className="mx-6 text-sm font-mono text-green-400">CORN: $180 ▲ 1.1%</span>
          <span className="mx-6 text-sm font-mono text-blue-400">SOY: $510 ▬ 0.0%</span>
          <span className="mx-6 text-sm font-mono text-green-400">SPICES: $1200 ▲ 5.4%</span>
          {/* Duplicate for infinite scroll effect */}
          <span className="mx-6 text-sm font-mono text-green-400">RICE: $450 ▲ 2.3%</span>
          <span className="mx-6 text-sm font-mono text-red-400">WHEAT: $320 ▼ 0.5%</span>
          <span className="mx-6 text-sm font-mono text-green-400">CORN: $180 ▲ 1.1%</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Globe className="text-purple-600" /> Global Trade Hub
            </h2>
            <p className="text-gray-500">Verified blockchain marketplace with real-time pricing.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center gap-2">
            <ShoppingCart className="text-gray-400" size={20} />
            <span className="font-bold text-gray-700">Verified Buyer ID: {user.username}</span>
          </div>
        </div>

        {/* MARKET GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {marketBatches.map((batch) => (
            <motion.div 
              key={batch._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-100 group relative"
            >
              <button onClick={() => handleRemove(batch._id)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>

              <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-800 p-6 relative">
                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <ShieldCheck size={12} /> CERTIFIED
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 mt-6">{batch.productType}</h3>
                <p className="text-gray-400 text-sm flex items-center gap-1"><MapPin size={14} /> {batch.location}</p>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-end mb-6">
                  <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Seller</p><p className="text-gray-700 font-medium">{batch.exporter?.username || "Verified Seller"}</p></div>
                  <div className="text-right"><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Volume</p><p className="text-xl font-bold text-gray-900">{batch.quantity}</p></div>
                </div>

                <div className="space-y-3">
                  
                  {/* AI ANALYSIS BUTTON */}
                  <button 
                    onClick={() => setViewAnalysis(batch)}
                    className="w-full py-2.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors"
                  >
                    <BarChart3 size={16} /> View AI Price Prediction
                  </button>

                  <button onClick={() => setViewCertificate(batch)} className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-sm border border-gray-200 flex items-center justify-center gap-2">
                    <ShieldCheck size={16} className="text-green-600" /> Verify Passport
                  </button>

                  {batch.orderStatus === 'None' && (
                     <button onClick={() => handleBuy(batch)} className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gray-900 hover:bg-black shadow-lg flex items-center justify-center gap-2 transition-all">
                       <ShoppingCart size={18} /> Place Order Request
                     </button>
                  )}
                  {batch.orderStatus === 'Pending' && (<div className="w-full py-3 rounded-xl font-bold text-sm bg-yellow-100 text-yellow-700 text-center flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Request Sent...</div>)}
                  {batch.orderStatus === 'Shipped' && (<div className="w-full py-3 rounded-xl font-bold text-sm bg-green-100 text-green-700 text-center flex items-center justify-center gap-2"><Truck size={18} /> In Transit</div>)}
                  {batch.orderStatus === 'Declined' && (<div className="w-full py-3 rounded-xl font-bold text-sm bg-red-100 text-red-700 text-center">Order Declined</div>)}
                </div>
              </div>
            </motion.div>
          ))}
          {marketBatches.length === 0 && <div className="col-span-full text-center py-20 text-gray-400">No items available.</div>}
        </div>

        {/* MODALS */}
        <AnimatePresence>
          {viewCertificate && <DigitalPassport batch={viewCertificate} inspection={{ moisture: '12%', pesticide: 'Safe', isoCode: 'ISO-22000' }} onClose={() => setViewCertificate(null)} />}
        </AnimatePresence>
        
        {/* NEW AI ANALYSIS MODAL */}
        <AnimatePresence>
          {viewAnalysis && <MarketAnalysis batch={viewAnalysis} onClose={() => setViewAnalysis(null)} />}
        </AnimatePresence>

      </div>
      <style>{` @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } `}</style>
    </div>
  );
};

export default ImporterDashboard;