import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, AlertCircle, BrainCircuit, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MarketAnalysis = ({ batch, onClose }) => {
  // Mock Data based on product type
  const data = [
    { month: 'Jan', price: 400 },
    { month: 'Feb', price: 420 },
    { month: 'Mar', price: 410 },
    { month: 'Apr', price: 450 },
    { month: 'May', price: 480 },
    { month: 'Jun', price: 460 },
    { month: 'Jul', price: 510 }, // Predicted Rise
  ];

  const isBullish = true; // Simulate "Good time to buy"

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/50">
              <BrainCircuit className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Market Intelligence</h2>
              <p className="text-xs text-gray-500 font-mono uppercase">Predictive Analytics • {batch.productType}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="text-gray-400" /></button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CHART SECTION */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-gray-400 text-sm font-bold uppercase">6-Month Price Trend</h3>
              <div className="flex items-center gap-2 text-green-400 bg-green-900/30 px-3 py-1 rounded-full border border-green-500/30">
                <TrendingUp size={16} /> +12.4% Forecast
              </div>
            </div>
            <div className="h-64 w-full bg-gray-800/30 rounded-xl border border-gray-700 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 50', 'dataMax + 50']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                    itemStyle={{ color: '#a78bfa' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI INSIGHTS SIDEBAR */}
          <div className="space-y-4">
            
            {/* Recommendation Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-900/50 to-emerald-900/20 border border-green-500/30">
              <h4 className="text-green-400 font-bold text-sm uppercase mb-2 flex items-center gap-2">
                <BrainCircuit size={16} /> AI Recommendation
              </h4>
              <p className="text-2xl font-bold text-white mb-1">STRONG BUY</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Global supply for {batch.productType} is shrinking due to weather patterns in the origin region. Prices are expected to surge next month.
              </p>
            </div>

            {/* Stats */}
            <div className="p-5 rounded-2xl bg-gray-800/50 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg"><DollarSign className="text-blue-400" size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400">Current Market Price</p>
                  <p className="text-lg font-bold text-white">$450.00 / ton</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg"><AlertCircle className="text-orange-400" size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400">Volatility Risk</p>
                  <p className="text-lg font-bold text-white">Low (Safe)</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default MarketAnalysis;