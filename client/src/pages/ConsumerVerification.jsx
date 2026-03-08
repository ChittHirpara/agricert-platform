import React, { useState } from 'react';
import api from '../utils/api';
import { Search, MapPin, ShieldCheck, FileText, CheckCircle2, User, FileDigit, Calendar, Box, ArrowRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ConsumerVerification = () => {
    const [productId, setProductId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!productId.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await api.get(`/api/verify/${productId}`);
            setResult(res.data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError("This product ID could not be found or has not been certified yet.");
            } else {
                setError("An error occurred during verification. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030603] text-white selection:bg-emerald-500/30 font-sans pb-20 relative overflow-hidden">

            {/* Ambient Background Visuals */}
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

            <div className="max-w-4xl mx-auto pt-24 px-4 relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex flex-col items-center mb-6">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="w-20 h-20 rounded-[28px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                        >
                            <ShieldCheck size={40} />
                        </motion.div>
                        <div className="flex flex-col items-center">
                            <motion.span
                                initial={{ opacity: 0, letterSpacing: "0.2em" }}
                                animate={{ opacity: 1, letterSpacing: "0.5em" }}
                                className="text-[10px] font-mono font-black text-emerald-500/60 uppercase tracking-[0.5em] mb-4"
                            >
                                Secure Verification Protocol
                            </motion.span>
                            <h1 className="text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter italic">
                                Consumer <span className="text-emerald-500">Validation</span>
                            </h1>
                            <div className="h-1 w-24 bg-emerald-500 mt-6 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                    <p className="mt-8 text-gray-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed italic">
                        Input your unique product identifier to trace its digital lineage on the permanent ledger.
                    </p>
                </motion.div>

                {/* Search Console */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 backdrop-blur-3xl border border-white/10 p-2 rounded-[32px] mb-16 shadow-2xl relative group"
                >
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <form onSubmit={handleVerify} className="relative flex items-center">
                        <div className="absolute left-6 text-emerald-500/40 group-focus-within:text-emerald-400 transition-colors">
                            <Search size={28} />
                        </div>
                        <input
                            type="text"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            placeholder="Enter Neural Product ID (e.g. 64b2d9f...)"
                            className="w-full bg-transparent border-none py-6 pl-16 pr-44 text-xl font-bold text-white placeholder:text-white/10 focus:ring-0 outline-none font-mono"
                        />
                        <button
                            type="submit"
                            disabled={loading || !productId.trim()}
                            className="absolute right-3 bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all flex items-center gap-3 disabled:opacity-50 disabled:grayscale"
                        >
                            {loading ? (
                                <><div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" /> Synchronizing...</>
                            ) : (
                                <>Validate <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-6 pb-6 text-xs font-bold text-red-400 flex items-center gap-2"
                            >
                                <Activity size={14} className="animate-pulse" /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Verification Results */}
                <AnimatePresence mode="wait">
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="space-y-8"
                        >
                            {/* Blockchain Resonance Header */}
                            <div className="relative group overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative bg-[#050A06] border border-emerald-500/20 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                                            <FileDigit size={32} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-black uppercase tracking-tight">Immutable Record Established</h3>
                                                <CheckCircle2 size={18} className="text-emerald-400" />
                                            </div>
                                            <p className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest">Protocol: Polygon Amoy Ledger</p>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 w-full md:w-auto overflow-hidden group/hash">
                                        <div className="flex items-center justify-between gap-10 mb-2">
                                            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.2em]">Transaction Anchor</span>
                                            <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">Live</div>
                                        </div>
                                        <span className="font-mono text-xs text-emerald-400/80 break-all group-hover/hash:text-emerald-400 transition-colors">{result.blockchain?.txHash}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Data Matrix */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Yield Specifications */}
                                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 hover:border-emerald-500/30 transition-all group">
                                    <h4 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                                        <Box size={18} className="text-emerald-500" /> Yield Specifications
                                    </h4>
                                    <div className="space-y-6">
                                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group-hover:bg-white/10 transition-colors">
                                            <span className="block text-[10px] font-mono text-emerald-500/40 uppercase tracking-widest mb-1">Crop Classification</span>
                                            <span className="text-xl font-bold text-white uppercase italic">{result.product?.cropName || "Anonymized"}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                                <span className="block text-[10px] font-mono text-emerald-500/40 uppercase tracking-widest mb-1">Batch Load</span>
                                                <span className="text-sm font-bold text-white uppercase">{result.product?.quantity || "N/A"}</span>
                                            </div>
                                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                                <span className="block text-[10px] font-mono text-emerald-500/40 uppercase tracking-widest mb-1">Sync Date</span>
                                                <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                                                    <Calendar size={12} className="text-emerald-500" />
                                                    {new Date(result.product?.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Node Origin */}
                                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 hover:border-emerald-500/30 transition-all group">
                                    <h4 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                                        <User size={18} className="text-emerald-500" /> Origin Integrity
                                    </h4>
                                    {result.farmer ? (
                                        <div className="space-y-6">
                                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group-hover:bg-white/10 transition-colors">
                                                <span className="block text-[10px] font-mono text-emerald-500/40 uppercase tracking-widest mb-1">Producing Node</span>
                                                <span className="text-xl font-bold text-white uppercase italic">{result.farmer?.name || "Verified Farm"}</span>
                                            </div>
                                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                                <span className="block text-[10px] font-mono text-emerald-500/40 uppercase tracking-widest mb-1">Geo-Location</span>
                                                <span className="text-sm text-white font-bold flex items-center gap-2 uppercase">
                                                    <MapPin size={16} className="text-emerald-500 animate-bounce" /> {result.product?.location || "Confidential"}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-32 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-[10px] font-mono text-gray-600 uppercase italic">Origin data encrypted for privacy</div>
                                    )}
                                </div>

                                {/* Neural Analysis Substrate */}
                                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:col-span-2 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 text-emerald-500/10">
                                        <Activity size={80} className="group-hover:text-emerald-500/20 transition-colors" />
                                    </div>

                                    <h4 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3 relative z-10">
                                        <FileText size={18} className="text-emerald-500" /> Lab-Verified Spectral Analysis
                                    </h4>

                                    {result.certification ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                                            <div className="bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                                                <span className="block text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-2 font-black">Status</span>
                                                <span className="text-emerald-400 font-black text-lg flex items-center gap-2 italic uppercase">
                                                    <CheckCircle2 size={18} /> {result.certification?.status || "VALID"}
                                                </span>
                                            </div>
                                            {result.certification?.ocrData && Object.entries(result.certification.ocrData).map(([key, value]) => (
                                                <div key={key} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all group/stat">
                                                    <span className="block text-[10px] font-mono text-emerald-500/40 uppercase tracking-widest mb-2 group-hover/stat:text-emerald-500/60">{key}</span>
                                                    <span className="text-white font-black text-lg uppercase italic">{value}</span>
                                                </div>
                                            ))}
                                            {!result.certification?.ocrData && (
                                                <div className="col-span-3 h-24 flex items-center text-[10px] font-mono text-gray-500 uppercase italic px-4 border border-white/5 rounded-2xl">
                                                    Neural OCR metadata is locked onto the physical batch QR signature.
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-[10px] font-mono text-gray-600 uppercase italic">Session certified under legacy protocol</div>
                                    )}
                                </div>

                                {/* SUPPLY CHAIN TIMELINE OVERHAUL */}
                                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] p-12 md:col-span-2 mt-4 relative group overflow-hidden">
                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                                    <h4 className="text-white font-black text-sm uppercase tracking-widest mb-12 flex items-center gap-3">
                                        <Activity size={18} className="text-emerald-500" /> Life-Cycle Neural Sequence
                                    </h4>

                                    <div className="relative">
                                        <div className="absolute top-5 left-4 right-4 h-0.5 bg-white/5 z-0 hidden sm:block" />
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: result.product?.status === 'certified' ? '100%' : '80%' }}
                                            className="absolute top-5 left-4 h-0.5 bg-emerald-500 z-0 hidden sm:block shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                        />

                                        <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-10 sm:gap-0">
                                            {[
                                                { icon: User, label: "Origin", sub: "Farmer", status: true },
                                                { icon: ShieldCheck, label: "Spectral Scan", sub: "OCR Scan", status: true },
                                                { icon: CheckCircle2, label: "QA Verified", sub: "Status OK", status: true },
                                                { icon: FileDigit, label: "Persistence", sub: "On-Chain", status: true },
                                                { icon: Gavel, label: "Market Ready", sub: "Auction Room", status: !!result.auction }
                                            ].map((node, i) => (
                                                <div key={i} className="flex flex-row sm:flex-col items-center gap-4 sm:gap-4 group/node">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${node.status ? 'bg-emerald-500 text-black shadow-emerald-500/20' : 'bg-[#08120B] border border-white/10 text-gray-600'}`}>
                                                        <node.icon size={22} className={node.status ? 'animate-pulse' : ''} />
                                                    </div>
                                                    <div className="text-left sm:text-center">
                                                        <span className={`block font-black text-[10px] uppercase tracking-tighter mb-1 transition-colors ${node.status ? 'text-white' : 'text-gray-500'}`}>{node.label}</span>
                                                        <span className="text-[8px] font-mono text-emerald-500/40 uppercase tracking-widest">{node.sub}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ConsumerVerification;
