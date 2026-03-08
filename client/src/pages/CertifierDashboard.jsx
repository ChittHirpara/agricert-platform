import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    Upload, FileText, CheckCircle, ShieldCheck, Box, Search,
    ArrowRight, Zap, Database, Cpu, Lightbulb, Star, Loader2,
    Package, Microscope, Leaf, ChevronRight, X, Hash,
    Clock, RefreshCw, Wallet, Bell, Copy
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import toast from 'react-hot-toast';

const ease = [0.16, 1, 0.3, 1];
const SAGE = '#84B179';

// ── Step Indicator ───────────────────────────────
const STEPS = [
    { label: 'Select', icon: Box },
    { label: 'Scan', icon: FileText },
    { label: 'Review', icon: Database },
    { label: 'Mint', icon: ShieldCheck },
];

const StepTrack = ({ current }) => (
    <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => {
            const done = i < current;
            const active = i === current;
            const Icon = s.icon;
            return (
                <React.Fragment key={s.label}>
                    <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-500 ${done ? 'bg-sage-600 border-sage-600 shadow-[0_0_16px_rgba(132,177,121,0.4)]' :
                            active ? 'bg-sage-600/20 border-sage-600/60' :
                                'bg-white/[0.03] border-white/[0.06]'
                            }`}>
                            <Icon size={15} className={done ? 'text-white' : active ? 'text-sage-400' : 'text-gray-700'} />
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${done || active ? 'text-sage-400' : 'text-gray-700'
                            }`}>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-px mx-1.5 transition-all duration-700 ${i < current ? 'bg-sage-600/60' : 'bg-white/[0.06]'
                            }`} style={{ minWidth: 24 }} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ── OCR Data Row ─────────────────────────────────
const DataRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
        <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">{label.replace(/([A-Z])/g, ' $1')}</span>
        <span className="text-sm font-bold text-white">{value}</span>
    </div>
);

// ── Main Component ───────────────────────────────
const CertifierDashboard = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [ocrData, setOcrData] = useState(null);
    const [isApproving, setIsApproving] = useState(false);
    const [blockchainHash, setBlockchainHash] = useState(null);
    const { scrollY } = useScroll();
    const navBg = useTransform(scrollY, [0, 50], ['rgba(6,12,5,0)', 'rgba(6,12,5,0.95)']);

    const currentStep = blockchainHash ? 3 : ocrData ? 2 : isScanning ? 1 : selectedBatch ? 0 : -1;

    useEffect(() => { fetchPendingBatches(); }, []);

    const fetchPendingBatches = async () => {
        try {
            const res = await api.get('/api/batches/pending');
            setBatches(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSelect = (batch) => {
        setSelectedBatch(batch);
        setOcrData(null); setBlockchainHash(null);
        setSelectedFile(null); setPreviewUrl(null);
    };

    const handleOcrScan = async () => {
        if (!selectedFile && !selectedBatch?.documentUrl) return;
        setIsScanning(true);
        try {
            let res;
            if (selectedFile) {
                const fd = new FormData();
                fd.append('document', selectedFile);
                fd.append('isDemo', !!selectedBatch?.isDemo);
                res = await api.post('/api/ocr/scan', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                res = await api.post('/api/ocr/scan',
                    { existingFilePath: selectedBatch.documentUrl, isDemo: !!selectedBatch.isDemo },
                    { headers: { 'Content-Type': 'application/json' } });
            }
            setOcrData(res.data.ocrData);
        } catch (err) {
            toast.error(err.response?.data?.error || err.response?.data?.msg || 'Scan failed');
        } finally { setIsScanning(false); }
    };

    const handleApprove = async () => {
        if (!selectedBatch || !ocrData) return;
        setIsApproving(true);
        try {
            const res = await api.post('/api/certifications/approve', { batchId: selectedBatch._id, ocrData });
            setBlockchainHash(res.data.batch?.blockchainHash || 'stored');
            toast.success('Certificate minted on blockchain!');
            setBatches(batches.filter(b => b._id !== selectedBatch._id));
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Approval failed');
        } finally { setIsApproving(false); }
    };

    const handleReject = async () => {
        if (!selectedBatch) return;
        try {
            await api.post('/api/certifications/reject', { batchId: selectedBatch._id, reason: 'Quality standards not met' });
            setBatches(batches.filter(b => b._id !== selectedBatch._id));
            setSelectedBatch(null); setOcrData(null); setBlockchainHash(null);
            setSelectedFile(null);
            toast.success('Batch rejected');
        } catch (err) { toast.error(err.response?.data?.msg || 'Rejection failed'); }
    };

    const handleReset = () => {
        setSelectedBatch(null); setOcrData(null); setBlockchainHash(null);
        setSelectedFile(null); setPreviewUrl(null);
    };

    return (
        <div className="min-h-screen bg-[#060c05] text-white font-sans overflow-x-hidden">

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-35" style={{
                    backgroundImage: 'radial-gradient(rgba(132,177,121,0.12) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                }} />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(132,177,121,0.05) 0%, transparent 70%)' }} />
            </div>

            {/* Nav */}
            <motion.header style={{ background: navBg }}
                className="fixed top-0 left-0 right-0 z-50 border-b border-transparent backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-sage-600/15 border border-sage-600/25">
                                <Leaf size={15} className="text-sage-500" />
                            </div>
                            <span className="font-black tracking-tight">Agri<span className="text-sage-500">Cert</span></span>
                        </div>
                        <ChevronRight size={14} className="text-gray-600" />
                        <span className="text-sm text-gray-500 font-medium">Certifier Terminal</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchPendingBatches}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] hover:border-white/15 transition-colors">
                            <RefreshCw size={13} className="text-gray-500" />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-600/10 border border-sage-600/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-sage-400 uppercase tracking-widest">Node Online</span>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease }} className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-600/10 border border-sage-600/20 mb-4">
                        <Microscope size={12} className="text-sage-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-sage-400">AI Certification Pipeline</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
                        Certifier <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 to-sage-300">Terminal</span>
                    </h1>
                    <p className="text-sm text-gray-500">Neural OCR extraction · Blockchain finality · {batches.length} batches awaiting</p>
                </motion.div>

                {/* Main layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left — Batch Queue */}
                    <div className="lg:col-span-4">
                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                                <div className="flex items-center gap-2.5">
                                    <Box size={16} className="text-sage-500" />
                                    <span className="font-black text-sm">Pending Queue</span>
                                </div>
                                <span className="text-xs font-bold text-gray-600 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.05]">
                                    {batches.length} active
                                </span>
                            </div>
                            <div className="divide-y divide-white/[0.03] max-h-[70vh] overflow-y-auto">
                                {batches.length === 0 ? (
                                    <div className="flex flex-col items-center py-16 gap-3 text-center">
                                        <CheckCircle size={36} strokeWidth={1} className="text-sage-600/20" />
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Queue Empty</p>
                                        <p className="text-[10px] text-gray-700">All batches certified</p>
                                    </div>
                                ) : (
                                    batches.map(batch => (
                                        <motion.div
                                            key={batch._id}
                                            whileHover={{ backgroundColor: 'rgba(132,177,121,0.04)' }}
                                            onClick={() => handleSelect(batch)}
                                            className={`relative px-5 py-4 cursor-pointer transition-all ${selectedBatch?._id === batch._id ? 'bg-sage-600/08' : ''
                                                }`}
                                        >
                                            {selectedBatch?._id === batch._id && (
                                                <motion.div layoutId="active-bar"
                                                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full"
                                                    style={{ background: SAGE }} />
                                            )}
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className={`font-black text-sm ${selectedBatch?._id === batch._id ? 'text-sage-300' : 'text-white'}`}>
                                                    {batch.cropName}
                                                </h4>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold uppercase tracking-wide">
                                                    Pending
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-600 font-medium">{batch.farmerId?.name || 'Farmer'}</p>
                                            <p className="text-[10px] text-gray-700 mt-0.5">{batch.quantity} · {batch.location}</p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right — Pipeline Canvas */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">

                            {/* Empty state */}
                            {!selectedBatch && !ocrData && !blockchainHash && (
                                <motion.div key="empty"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="h-[70vh] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.05] bg-white/[0.01]"
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                                        className="w-20 h-20 flex items-center justify-center rounded-2xl border border-sage-600/20 bg-sage-600/08 mb-6"
                                    >
                                        <Cpu size={36} strokeWidth={1} className="text-sage-600/40" />
                                    </motion.div>
                                    <h3 className="text-2xl font-black text-white/20 tracking-tight mb-2">Neural Consensus Hub</h3>
                                    <p className="text-xs text-gray-700 max-w-xs text-center">Select a batch from the queue to start the AI certification pipeline</p>
                                    <div className="flex gap-3 mt-6">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-sage-600/30"
                                                style={{ animation: `bounce 1.4s infinite ${i * 0.2}s` }} />
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Active pipeline */}
                            {(selectedBatch || ocrData) && !blockchainHash && (
                                <motion.div key="pipeline"
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, ease }}
                                    className="rounded-2xl border border-white/[0.06] bg-[#080f07]/80 p-6"
                                >
                                    <StepTrack current={Math.max(0, currentStep)} />

                                    {/* Init step */}
                                    {!ocrData && (
                                        <div className="flex flex-col items-center gap-6 py-8">
                                            <div className="w-full max-w-md bg-black/30 border border-sage-600/15 rounded-2xl p-6">
                                                {/* Batch details */}
                                                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.05]">
                                                    <div className="w-12 h-12 rounded-xl bg-sage-600/15 border border-sage-600/25 flex items-center justify-center">
                                                        <FileText size={20} className="text-sage-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white text-lg leading-tight">{selectedBatch?.cropName}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <p className="text-[10px] text-sage-500 font-mono">ID-{selectedBatch?._id.slice(-8)}</p>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigator.clipboard.writeText(selectedBatch?._id);
                                                                    toast.success('Product ID copied to clipboard!');
                                                                }}
                                                                className="p-1 rounded-md bg-white/[0.03] border border-white/[0.06] hover:bg-sage-600/20 hover:text-sage-400 hover:border-sage-600/30 text-gray-400 transition-all"
                                                                title="Copy full Product ID"
                                                            >
                                                                <Copy size={10} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 mb-5">
                                                    {[
                                                        { label: 'Farmer', value: selectedBatch?.farmerId?.name || 'Anon' },
                                                        { label: 'Quantity', value: selectedBatch?.quantity },
                                                        { label: 'Location', value: selectedBatch?.location },
                                                        { label: 'Demo', value: selectedBatch?.isDemo ? 'Yes' : 'No' },
                                                    ].map(({ label, value }) => (
                                                        <div key={label} className="bg-white/[0.03] rounded-xl p-3">
                                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mb-0.5">{label}</p>
                                                            <p className="text-sm font-bold text-white">{value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex items-start gap-3 p-3 rounded-xl bg-sage-600/05 border border-sage-600/15">
                                                    <Database size={14} className="text-sage-500 mt-0.5 shrink-0" />
                                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                                        <strong className="text-sage-500 uppercase tracking-wider block mb-1">Neural OCR Protocol</strong>
                                                        Deep extraction of moisture, biomass, and cryptographic origin markers for immutable certification.
                                                    </p>
                                                </div>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(132,177,121,0.3)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleOcrScan} disabled={isScanning}
                                                className="w-full max-w-md py-4 bg-sage-600 rounded-xl font-black text-sm uppercase tracking-widest text-white flex items-center justify-center gap-2.5 hover:bg-sage-500 transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(132,177,121,0.2)]"
                                            >
                                                {isScanning
                                                    ? <><Loader2 size={18} className="animate-spin" /> Scanning...</>
                                                    : <><ShieldCheck size={18} /> Initiate Spectral Scan</>
                                                }
                                            </motion.button>
                                        </div>
                                    )}

                                    {/* OCR Results */}
                                    {ocrData && !blockchainHash && (
                                        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, ease }} className="space-y-5">

                                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                                                {/* OCR Data */}
                                                <div className="xl:col-span-2 rounded-2xl border border-white/[0.06] bg-black/20 p-5">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <Database size={16} className="text-sage-500" />
                                                            <h4 className="font-black text-sm">Spectral Data</h4>
                                                        </div>
                                                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-sage-600/10 border border-sage-600/20">
                                                            <span className="text-[10px] font-mono text-sage-400 uppercase tracking-wider">Confidence</span>
                                                            <span className="text-lg font-black text-white">{ocrData.confidence || 98}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="divide-y divide-white/[0.04]">
                                                        {Object.entries(ocrData)
                                                            .filter(([k]) => !['rawText', 'prediction', 'confidence'].includes(k))
                                                            .map(([key, value]) => (
                                                                <DataRow key={key} label={key} value={value} />
                                                            ))}
                                                    </div>
                                                </div>

                                                {/* Quality Sidebar */}
                                                <div className="space-y-4">
                                                    {/* Document preview */}
                                                    <div className="rounded-2xl border border-white/[0.06] bg-black/30 overflow-hidden">
                                                        <div className="px-4 py-3 border-b border-white/[0.05]">
                                                            <p className="text-[10px] font-bold text-sage-500 uppercase tracking-widest">Document</p>
                                                        </div>
                                                        <div className="aspect-[3/4] relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                                            <img
                                                                src={previewUrl || (selectedBatch?.documentUrl ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedBatch.documentUrl}` : '')}
                                                                alt="Certificate" className="w-full h-full object-cover opacity-60"
                                                            />
                                                            <div className="absolute bottom-3 left-3 z-20 px-2 py-1 bg-sage-600 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider">
                                                                Verified
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Quality tier */}
                                                    {ocrData.prediction && (
                                                        <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Star size={14} className="text-sage-500" fill="#84B179" />
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Quality Rating</span>
                                                            </div>
                                                            <div className="flex gap-1.5 mb-3">
                                                                {[1, 2, 3, 4, 5].map(s => (
                                                                    <div key={s} className="flex-1 h-1.5 rounded-full transition-all"
                                                                        style={{
                                                                            background: s <= Math.round((ocrData.prediction?.probability || 0.8) * 5)
                                                                                ? SAGE : 'rgba(255,255,255,0.06)'
                                                                        }} />
                                                                ))}
                                                            </div>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-[10px] text-gray-600">Score</span>
                                                                <span className="text-xl font-black text-white">{Math.round((ocrData.prediction?.probability || 0) * 100)}%</span>
                                                            </div>
                                                            <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${Math.round((ocrData.prediction?.probability || 0) * 100)}%` }}
                                                                    transition={{ duration: 1.5, ease: 'circOut' }}
                                                                    className="h-full rounded-full"
                                                                    style={{ background: `linear-gradient(to right, ${SAGE}, #C7EABB)`, boxShadow: `0 0 10px ${SAGE}60` }}
                                                                />
                                                            </div>
                                                            {ocrData.prediction.suggestion && (
                                                                <p className="mt-3 text-[10px] text-gray-500 italic leading-relaxed border-t border-white/[0.04] pt-3">
                                                                    "{ocrData.prediction.suggestion}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-2 border-t border-white/[0.05]">
                                                <button onClick={handleReject}
                                                    className="px-6 py-3 border border-white/[0.08] rounded-xl text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500/08 hover:text-red-400 hover:border-red-500/25 transition-all">
                                                    Reject
                                                </button>
                                                <motion.button
                                                    whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(132,177,121,0.3)' }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handleApprove} disabled={isApproving}
                                                    className="flex-1 py-3 bg-sage-600 rounded-xl font-black text-sm uppercase tracking-widest text-white flex items-center justify-center gap-2 hover:bg-sage-500 transition-all disabled:opacity-60"
                                                >
                                                    {isApproving
                                                        ? <Loader2 size={16} className="animate-spin" />
                                                        : <><ShieldCheck size={16} /> Commit to Blockchain</>
                                                    }
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {/* Success state */}
                            {blockchainHash && (
                                <motion.div key="success"
                                    initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, ease }}
                                    className="rounded-2xl border border-sage-600/20 bg-[#080f07]/80 p-10 flex flex-col items-center text-center min-h-[60vh] justify-center relative overflow-hidden"
                                >
                                    {/* Glow */}
                                    <div className="absolute inset-0 pointer-events-none"
                                        style={{ background: 'radial-gradient(circle at center, rgba(132,177,121,0.08) 0%, transparent 70%)' }} />

                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', damping: 14, stiffness: 120 }}
                                        className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(132,177,121,0.4)] mb-8"
                                        style={{ background: `linear-gradient(135deg, ${SAGE}, #A2CB8B)` }}
                                    >
                                        <ShieldCheck size={48} className="text-[#060c05]" strokeWidth={2.5} />
                                    </motion.div>

                                    <h2 className="text-4xl font-black text-white tracking-tight mb-2">
                                        Minting <span className="text-sage-400">Confirmed</span>
                                    </h2>
                                    <p className="text-gray-500 text-sm mb-8">Permanent record inscribed on Polygon Mainnet</p>

                                    <div className="w-full max-w-lg bg-black/40 border border-sage-600/15 rounded-2xl p-5 text-left mb-6">
                                        <p className="text-[10px] font-mono text-sage-600 uppercase tracking-widest mb-2">Transaction Hash</p>
                                        <p className="font-mono text-xs text-sage-400 break-all leading-relaxed">{blockchainHash}</p>
                                        <div className="flex gap-6 mt-3 pt-3 border-t border-white/[0.05]">
                                            {[{ l: 'Network', v: 'Polygon POS' }, { l: 'Status', v: 'Finalized' }].map(({ l, v }) => (
                                                <div key={l}>
                                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mb-0.5">{l}</p>
                                                    <p className="text-xs font-bold text-white uppercase">{v}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button onClick={handleReset}
                                        className="flex items-center gap-2 px-6 py-3 bg-white/[0.04] border border-white/[0.08] hover:bg-sage-600/10 hover:border-sage-600/20 rounded-xl font-bold text-sm text-gray-400 hover:text-sage-400 transition-all uppercase tracking-widest">
                                        Next Payload <ArrowRight size={15} className="text-sage-500" />
                                    </button>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertifierDashboard;
