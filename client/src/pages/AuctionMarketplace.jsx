import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import {
    Package, Gavel, MapPin, ExternalLink, ShieldCheck, TrendingUp,
    Search, Leaf, ChevronRight, RefreshCw, Globe, Scale, Hash, Copy
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import toast from 'react-hot-toast';

const ease = [0.16, 1, 0.3, 1];
const SAGE = '#84B179';

const AuctionMarketplace = ({ user }) => {
    const [activeAuctions, setActiveAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const navBg = useTransform(scrollY, [0, 50], ['rgba(6,12,5,0)', 'rgba(6,12,5,0.95)']);

    useEffect(() => {
        fetchAuctions();
        const interval = setInterval(fetchAuctions, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchAuctions = async () => {
        try {
            const res = await api.get('/api/auction/list');
            setActiveAuctions(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const filtered = activeAuctions.filter(b =>
        (b.batchId?.cropName || b.cropName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        b._id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#060c05] text-white font-sans overflow-x-hidden pb-20">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-35" style={{
                    backgroundImage: 'radial-gradient(rgba(132,177,121,0.12) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                }} />
                <motion.div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(132,177,121,0.05) 0%, transparent 70%)' }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
            </div>

            <motion.header style={{ background: navBg }} className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sage-600/15 border border-sage-600/25 flex items-center justify-center">
                                <Leaf size={15} className="text-sage-500" />
                            </div>
                            <span className="font-black">Agri<span className="text-sage-500">Cert</span></span>
                        </div>
                        <ChevronRight size={14} className="text-gray-600" />
                        <span className="text-sm text-gray-500 font-medium">Live Marketplace</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchAuctions}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] hover:border-white/15 transition-colors">
                            <RefreshCw size={13} className="text-gray-500" />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-600/10 border border-sage-600/20">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sage-600" />
                            </span>
                            <span className="text-[10px] font-bold text-sage-400 uppercase tracking-widest">{activeAuctions.length} Active</span>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-8">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease }} className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-600/10 border border-sage-600/20 mb-5">
                        <Gavel size={12} className="text-sage-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-sage-400">Neural Trading Network</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
                        Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 to-sage-300">Marketplace</span>
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
                        Bid on certified agricultural lots in real time. Fully transparent, fully on-chain.
                    </p>
                </motion.div>

                <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                    <div className="relative flex-1 w-full max-w-md group">
                        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-sage-500 transition-colors" />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by crop or batch ID..."
                            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-700 outline-none focus:border-sage-600/50 transition-all" />
                    </div>
                    <span className="text-xs text-gray-700 font-mono uppercase tracking-widest">Auto-refresh: 15s</span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="relative w-10 h-10">
                            <div className="absolute inset-0 border-2 border-sage-600/15 rounded-full" />
                            <div className="absolute inset-0 border-2 border-sage-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <span className="text-[10px] font-mono text-sage-600/50 uppercase tracking-widest animate-pulse">Syncing Market Data...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center py-28 rounded-2xl border border-white/[0.05] bg-white/[0.01] gap-4">
                        <div className="w-16 h-16 flex items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                            <Package size={28} strokeWidth={1} className="text-sage-600/25" />
                        </div>
                        <p className="font-black text-white/20 text-sm uppercase tracking-widest">
                            {searchQuery ? 'No matching auctions' : 'Market Silent'}
                        </p>
                        <p className="text-xs text-gray-700 max-w-xs text-center">
                            {searchQuery ? 'Try a different search.' : 'No active auctions right now. Check back shortly.'}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial="hidden" animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    >
                        {filtered.map(batch => <AuctionCard key={batch._id} batch={batch} onEnter={() => navigate(`/auction/${batch._id}`)} />)}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const AuctionCard = ({ batch, onEnter }) => {
    const cropName = batch.batchId?.cropName || batch.cropName || 'Unknown Batch';
    const bid = batch.highestBid || batch.startingPrice || 500;
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }}
            whileHover={{ y: -6 }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080f07]/80 hover:border-sage-600/20 transition-all duration-500"
        >
            <div className="h-[2px] bg-gradient-to-r from-transparent via-sage-600/50 to-transparent" />
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-600/15 border border-sage-600/30">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-pulse" />
                <span className="text-[9px] font-bold text-sage-400 uppercase tracking-widest">Live</span>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: 'radial-gradient(circle at top right, rgba(132,177,121,0.07), transparent 70%)' }} />
            <div className="p-6 flex-1 relative z-10">
                <div className="mb-5 pr-16">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sage-600/10 border border-sage-600/20 mb-2">
                        <ShieldCheck size={10} className="text-sage-500" />
                        <span className="text-[8px] font-bold text-sage-400 uppercase tracking-widest">Certified</span>
                    </div>
                    <h3 className="font-black text-xl text-white tracking-tight group-hover:text-sage-300 transition-colors">{cropName}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[10px] font-mono text-gray-700">ID: {batch._id.slice(0, 12)}...</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(batch._id);
                                toast.success('Product ID copied to clipboard!');
                            }}
                            className="p-1 rounded-md bg-white/[0.03] border border-white/[0.06] hover:bg-sage-600/20 hover:text-sage-400 hover:border-sage-600/30 text-gray-500 transition-all"
                            title="Copy full Product ID"
                        >
                            <Copy size={10} />
                        </button>
                    </div>
                </div>
                <div className="space-y-3 mb-5">
                    {[
                        { icon: Scale, label: 'Yield', value: batch.quantity || '—' },
                        { icon: MapPin, label: 'Origin', value: batch.location || '—' },
                        { icon: TrendingUp, label: 'Live Bid', value: `$${bid.toLocaleString()}`, accent: true },
                    ].map(({ icon: Icon, label, value, accent }) => (
                        <div key={label} className="flex items-center gap-3 p-2.5 rounded-xl border border-white/[0.04] bg-white/[0.015]">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03]">
                                <Icon size={14} className={accent ? 'text-sage-500' : 'text-gray-600'} />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-700 font-mono uppercase tracking-wider">{label}</p>
                                <p className={`text-sm font-bold ${accent ? 'text-sage-400' : 'text-white'}`}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {batch.blockchainHash && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl border border-white/[0.04] bg-black/20 mb-2 group/hash">
                        <Hash size={12} className="text-gray-700 mt-0.5 shrink-0" />
                        <p className="text-[9px] font-mono text-gray-700 group-hover/hash:text-sage-500 transition-colors truncate">
                            {batch.blockchainHash.slice(0, 32)}...
                        </p>
                    </div>
                )}
            </div>
            <div className="p-4 pt-0 relative z-10">
                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(132,177,121,0.3)' }}
                    whileTap={{ scale: 0.98 }} onClick={onEnter}
                    className="w-full py-3.5 bg-sage-600 text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sage-500 transition-all shadow-[0_0_16px_rgba(132,177,121,0.15)]"
                >
                    Enter Auction <ExternalLink size={14} />
                </motion.button>
            </div>
        </motion.div>
    );
};

export default AuctionMarketplace;
