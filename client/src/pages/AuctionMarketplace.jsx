import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Package, Gavel, MapPin, Calendar, ExternalLink, ShieldCheck, TrendingUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuctionMarketplace = ({ user }) => {
    const [activeAuctions, setActiveAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAuctions();
        const interval = setInterval(fetchAuctions, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchAuctions = async () => {
        try {
            const res = await api.get('/api/auction/list');
            setActiveAuctions(res.data);
        } catch (err) {
            console.error('Failed to fetch auctions', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredAuctions = activeAuctions.filter(batch =>
        (batch.batchId?.cropName || batch.cropName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch._id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <div className="min-h-screen bg-[#030603] text-white selection:bg-emerald-500/30 font-sans pb-20 relative overflow-hidden">

            {/* Ambient Animated Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08)_0%,transparent_50%)]" />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                        x: [0, 100, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-emerald-900/10 rounded-full blur-[150px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.05, 0.15, 0.05],
                        x: [0, -50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                    className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-green-900/5 rounded-full blur-[120px]"
                />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] mix-blend-overlay" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">

                {/* Cinematic Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex flex-col items-center mb-6">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                        >
                            <Gavel size={32} />
                        </motion.div>
                        <div className="flex flex-col items-center">
                            <motion.span
                                initial={{ opacity: 0, letterSpacing: "0.2em" }}
                                animate={{ opacity: 1, letterSpacing: "0.5em" }}
                                className="text-[10px] font-mono font-black text-emerald-500/60 uppercase tracking-[0.5em] mb-3"
                            >
                                Neural Trading Network
                            </motion.span>
                            <h1 className="text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter italic">
                                Live <span className="text-emerald-500">Marketplace</span>
                            </h1>
                            <div className="h-1 w-24 bg-emerald-500 mt-4 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                    <p className="mt-6 text-gray-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                        Access and participate in the world's most secure agricultural bidding protocol. Fully certified, fully transparent.
                    </p>
                </motion.div>

                {/* Filter & Search Bar */}
                <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="relative w-full md:max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Locate yield via batch ID or crop type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-600"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                {activeAuctions.length} Node(s) Active
                            </span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full" />
                            <div className="absolute inset-0 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <span className="text-[10px] font-mono font-black text-emerald-500/60 uppercase tracking-[0.3em] animate-pulse">Syncing Neural Data...</span>
                    </div>
                ) : filteredAuctions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] p-20 text-center flex flex-col items-center justify-center"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-gray-600 mb-6">
                            <Package size={40} className="opacity-20" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">No Active Sessions</h3>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium italic">
                            The marketplace is currently silent. Secure certification protocols are pending.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredAuctions.map((batch) => (
                            <motion.div
                                key={batch._id}
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                className="group relative"
                            >
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative bg-[#050A06] border border-white/10 rounded-[40px] overflow-hidden flex flex-col shadow-2xl transition-all duration-500 group-hover:border-emerald-500/30">

                                    {/* Card Header Overlay */}
                                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none opacity-50" />

                                    <div className="p-8 pb-4 relative z-10 flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                                    Premium Grade
                                                </div>
                                            </div>
                                            <h3 className="font-black text-2xl text-white tracking-tight uppercase group-hover:text-emerald-400 transition-colors">
                                                {batch.batchId?.cropName || batch.cropName || 'Unknown Batch'}
                                            </h3>
                                            <p className="text-gray-500 font-mono text-[10px] mt-1 tracking-wider uppercase">Node: {batch._id.substring(0, 12)}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-black border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                            LIVE
                                        </div>
                                    </div>

                                    <div className="px-8 py-6 flex-1 space-y-5 relative z-10">
                                        <div className="flex items-center gap-4 group/item">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover/item:text-emerald-400 group-hover/item:border-emerald-500/30 transition-all shadow-inner">
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-mono text-emerald-500/40 uppercase tracking-widest leading-none mb-1">Total Yield</p>
                                                <p className="text-sm font-bold text-white uppercase">{batch.quantity || '0 Units'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 group/item">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover/item:text-emerald-400 group-hover/item:border-emerald-500/30 transition-all shadow-inner">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-mono text-emerald-500/40 uppercase tracking-widest leading-none mb-1">Geographic Origin</p>
                                                <p className="text-sm font-bold text-white uppercase truncate max-w-[180px]">{batch.location || 'Encrypted Territory'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 group/item">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover/item:text-emerald-400 group-hover/item:border-emerald-500/30 transition-all shadow-inner">
                                                <TrendingUp size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-mono text-emerald-500/40 uppercase tracking-widest leading-none mb-1">Live Valuation</p>
                                                <p className="text-sm font-black text-emerald-500 uppercase">${(batch.highestBid || 500).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {batch.blockchainHash && (
                                            <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 flex items-center gap-3 mt-6 group/tx">
                                                <ShieldCheck size={16} className="text-emerald-500/40 group-hover/tx:text-emerald-500 transition-colors" />
                                                <div className="font-mono text-[9px] text-emerald-500/60 break-all overflow-hidden flex-1 group-hover/tx:text-emerald-400 transition-colors">
                                                    {batch.blockchainHash.substring(0, 32)}...
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 pt-2">
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => navigate(`/auction/${batch._id}`)}
                                            className="w-full relative group/btn overflow-hidden rounded-2xl h-16 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-3">
                                                Connect to Link <ExternalLink size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                            </span>
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20 group-hover/btn:h-2 transition-all" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AuctionMarketplace;
