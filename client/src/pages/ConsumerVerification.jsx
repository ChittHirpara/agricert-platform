import React, { useState } from 'react';
import api from '../utils/api';
import {
    Search, MapPin, ShieldCheck, FileText, CheckCircle2, User,
    FileDigit, Calendar, Box, ArrowRight, Activity, Leaf,
    ChevronRight, Gavel, Hash, Loader2, AlertTriangle, X
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1];
const SAGE = '#84B179';

// ── Supply chain step ────────────────────────────
const CHAIN_STEPS = [
    { icon: User, label: 'Farm Origin', sub: 'Farmer' },
    { icon: ShieldCheck, label: 'OCR Scan', sub: 'AI Verified' },
    { icon: CheckCircle2, label: 'QA Pass', sub: 'Status OK' },
    { icon: FileDigit, label: 'On-Chain', sub: 'Blockchain' },
    { icon: Gavel, label: 'Market', sub: 'Auction' },
];

// ── Info Card ────────────────────────────────────
const InfoCard = ({ label, value, mono }) => (
    <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:border-sage-600/20 hover:bg-white/[0.04] transition-all group">
        <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1.5">{label}</p>
        <p className={`text-sm font-bold text-white ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
);

const ConsumerVerification = () => {
    const [productId, setProductId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const { scrollY } = useScroll();
    const navBg = useTransform(scrollY, [0, 50], ['rgba(6,12,5,0)', 'rgba(6,12,5,0.95)']);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!productId.trim()) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const res = await api.get(`/api/verify/${productId}`);
            setResult(res.data);
        } catch (err) {
            setError(err.response?.status === 404
                ? 'This product ID could not be found or has not been certified yet.'
                : 'An error occurred during verification. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#060c05] text-white font-sans overflow-x-hidden pb-20">

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-35" style={{
                    backgroundImage: 'radial-gradient(rgba(132,177,121,0.12) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(132,177,121,0.04) 0%, transparent 70%)' }} />
            </div>

            {/* Nav */}
            <motion.header style={{ background: navBg }} className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sage-600/15 border border-sage-600/25 flex items-center justify-center">
                                <Leaf size={15} className="text-sage-500" />
                            </div>
                            <span className="font-black">Agri<span className="text-sage-500">Cert</span></span>
                        </div>
                        <ChevronRight size={14} className="text-gray-600" />
                        <span className="text-sm text-gray-500 font-medium">Verify Product</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-600/10 border border-sage-600/20">
                        <ShieldCheck size={12} className="text-sage-500" />
                        <span className="text-[10px] font-bold text-sage-400 uppercase tracking-widest">Secure Protocol</span>
                    </div>
                </div>
            </motion.header>

            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-8">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease }} className="text-center mb-10">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 rounded-2xl bg-sage-600/15 border border-sage-600/25 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(132,177,121,0.15)]"
                    >
                        <ShieldCheck size={30} className="text-sage-500" />
                    </motion.div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-600/10 border border-sage-600/20 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-sage-400">Secure Verification Protocol</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
                        Consumer <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 to-sage-300">Validation</span>
                    </h1>
                    <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                        Enter a product ID to trace its complete digital lineage on the permanent blockchain ledger.
                    </p>
                </motion.div>

                {/* Search Console */}
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1, ease }}
                    className="mb-8"
                >
                    <form onSubmit={handleVerify}>
                        <div className="group flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-2 pl-5 focus-within:border-sage-600/50 focus-within:bg-white/[0.06] transition-all shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                            <Search size={18} className="text-gray-600 group-focus-within:text-sage-500 transition-colors shrink-0" />
                            <input
                                type="text" value={productId} onChange={e => setProductId(e.target.value)}
                                placeholder="Enter Product ID (e.g. 64b2d9f3a...)"
                                className="flex-1 bg-transparent py-3 text-white placeholder-gray-700 outline-none text-lg font-mono font-bold"
                            />
                            {productId && (
                                <button type="button" onClick={() => { setProductId(''); setResult(null); setError(null); }}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.08] transition-all">
                                    <X size={14} />
                                </button>
                            )}
                            <motion.button
                                type="submit" disabled={loading || !productId.trim()}
                                whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(132,177,121,0.35)' }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-3 bg-sage-600 hover:bg-sage-500 text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Verify</>}
                            </motion.button>
                        </div>
                    </form>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2.5 mt-3 px-4 py-3 rounded-xl bg-red-500/08 border border-red-500/20 text-red-400 text-sm font-medium">
                                <AlertTriangle size={15} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Results */}
                <AnimatePresence mode="wait">
                    {result && (
                        <motion.div key="results"
                            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
                            transition={{ duration: 0.5, ease }}
                            className="space-y-4"
                        >
                            {/* Confirmed header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-sage-600/20 bg-sage-600/05 relative overflow-hidden">
                                <div className="absolute inset-0"
                                    style={{ background: 'radial-gradient(circle at top left, rgba(132,177,121,0.06), transparent 60%)' }} />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-sage-600/15 border border-sage-600/25 flex items-center justify-center">
                                        <FileDigit size={22} className="text-sage-500" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="font-black text-white text-base uppercase tracking-tight">Record Verified</h3>
                                            <CheckCircle2 size={15} className="text-sage-400" />
                                        </div>
                                        <p className="text-[10px] font-mono text-sage-600 uppercase tracking-widest">Polygon Amoy Ledger</p>
                                    </div>
                                </div>
                                {result.blockchain?.txHash && (
                                    <div className="relative z-10 bg-black/30 border border-white/[0.06] rounded-xl px-4 py-2.5 max-w-xs w-full sm:w-auto">
                                        <p className="text-[9px] text-gray-600 font-mono uppercase tracking-widest mb-1">Transaction Hash</p>
                                        <p className="font-mono text-[10px] text-sage-400 break-all">{result.blockchain.txHash}</p>
                                    </div>
                                )}
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Product card */}
                                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/[0.05]">
                                        <Box size={15} className="text-sage-500" />
                                        <h4 className="font-black text-sm uppercase tracking-tight">Yield Specifications</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <InfoCard label="Crop Classification" value={result.product?.cropName || 'Anonymized'} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <InfoCard label="Batch Load" value={result.product?.quantity || 'N/A'} />
                                            <InfoCard label="Verified On" value={result.product?.createdAt ? new Date(result.product.createdAt).toLocaleDateString() : 'N/A'} />
                                        </div>
                                    </div>
                                </div>

                                {/* Farmer card */}
                                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/[0.05]">
                                        <User size={15} className="text-sage-500" />
                                        <h4 className="font-black text-sm uppercase tracking-tight">Origin Integrity</h4>
                                    </div>
                                    {result.farmer ? (
                                        <div className="space-y-3">
                                            <InfoCard label="Producing Node" value={result.farmer?.name || 'Verified Farm'} />
                                            <InfoCard label="Geo-Location" value={result.product?.location || 'Confidential'} />
                                        </div>
                                    ) : (
                                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/[0.05] rounded-xl text-[10px] font-mono text-gray-700 italic">
                                            Origin encrypted for privacy
                                        </div>
                                    )}
                                </div>

                                {/* OCR/Certification Data */}
                                {result.certification && (
                                    <div className="sm:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                                        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/[0.05]">
                                            <FileText size={15} className="text-sage-500" />
                                            <h4 className="font-black text-sm uppercase tracking-tight">Lab Spectral Analysis</h4>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="p-4 rounded-xl border bg-sage-600/08 flex flex-col gap-1"
                                                style={{ borderColor: 'rgba(132,177,121,0.2)' }}>
                                                <span className="text-[9px] font-mono text-sage-500 uppercase tracking-widest">Status</span>
                                                <span className="text-sage-400 font-black text-base flex items-center gap-1.5">
                                                    <CheckCircle2 size={14} /> {result.certification?.status || 'VALID'}
                                                </span>
                                            </div>
                                            {result.certification?.ocrData && Object.entries(result.certification.ocrData).map(([key, value]) => (
                                                <div key={key} className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:border-sage-600/20 transition-colors">
                                                    <span className="block text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">{key}</span>
                                                    <span className="text-sm font-bold text-white">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Supply Chain Timeline */}
                                <div className="sm:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sage-600/30 to-transparent" />
                                    <div className="flex items-center gap-2.5 mb-6">
                                        <Activity size={15} className="text-sage-500" />
                                        <h4 className="font-black text-sm uppercase tracking-tight">Life-Cycle Sequence</h4>
                                    </div>
                                    <div className="relative">
                                        {/* Progress bar */}
                                        <div className="absolute top-5 left-4 right-4 h-px bg-white/[0.05] hidden sm:block" />
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: result.product?.status === 'certified' ? '100%' : '80%' }}
                                            transition={{ duration: 1.5, ease: 'circOut', delay: 0.4 }}
                                            className="absolute top-5 left-4 h-px hidden sm:block rounded-full"
                                            style={{ background: `linear-gradient(to right, ${SAGE}, #C7EABB)`, boxShadow: `0 0 8px ${SAGE}60` }}
                                        />
                                        <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 relative z-10">
                                            {CHAIN_STEPS.map(({ icon: Icon, label, sub }, i) => {
                                                const done = i < 4 || (i === 4 && !!result.auction);
                                                return (
                                                    <div key={label} className="flex flex-row sm:flex-col items-center gap-3 sm:gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${done
                                                            ? 'border-sage-600/50 shadow-[0_0_16px_rgba(132,177,121,0.3)]'
                                                            : 'border-white/[0.06] bg-white/[0.02]'
                                                            }`} style={done ? { background: `${SAGE}20`, boxShadow: `0 0 16px ${SAGE}30` } : {}}>
                                                            <Icon size={18} style={{ color: done ? SAGE : 'rgba(255,255,255,0.2)' }} />
                                                        </div>
                                                        <div className="text-left sm:text-center">
                                                            <p className={`font-black text-[10px] uppercase tracking-tight ${done ? 'text-white' : 'text-gray-700'}`}>{label}</p>
                                                            <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">{sub}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty hero */}
                {!result && !error && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                        className="text-center py-16 text-gray-700">
                        <div className="flex justify-center gap-3 mb-4">
                            {['Polygon POS', 'OCR AI', 'Immutable'].map(t => (
                                <span key={t} className="text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">{t}</span>
                            ))}
                        </div>
                        <p className="text-xs">Enter a product ID above to verify its chain of custody</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ConsumerVerification;
