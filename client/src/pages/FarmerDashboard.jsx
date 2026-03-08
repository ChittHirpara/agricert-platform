import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import {
    Plus, Upload, Play, Package, Loader2, Leaf, ShieldCheck,
    Link as LinkIcon, Zap, ArrowRight, X, Wheat, MapPin,
    Scale, Clock, CheckCircle2, AlertCircle, BarChart3,
    TrendingUp, Hash, FileText, ChevronRight, Sparkles,
    LogOut, Settings, Bell, Search, Copy
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import toast from 'react-hot-toast';

const ease = [0.16, 1, 0.3, 1];

// ── Status config ────────────────────────────────
const STATUS = {
    certified: { label: 'Certified', color: '#84B179', bg: 'rgba(132,177,121,0.1)', border: 'rgba(132,177,121,0.25)', icon: CheckCircle2 },
    pending: { label: 'Pending', color: '#A2CB8B', bg: 'rgba(162,203,139,0.06)', border: 'rgba(162,203,139,0.15)', icon: Clock },
    rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', icon: AlertCircle },
};

// ── Stat Card ────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay, ease }}
        whileHover={{ y: -4 }}
        className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] hover:border-sage-600/25 hover:bg-white/[0.04] transition-all duration-500 p-6 cursor-default"
    >
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* BG icon */}
        <Icon
            size={80} strokeWidth={0.5}
            className="absolute -right-4 -bottom-4 text-white/[0.03] group-hover:text-sage-600/[0.07] transition-all duration-700"
        />
        <div className="relative z-10">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-600 mb-3">{label}</p>
            <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">{sub}</p>
        </div>
    </motion.div>
);

// ── Batch Status Badge ───────────────────────────
const StatusBadge = ({ status }) => {
    const s = STATUS[status] || STATUS.pending;
    const Icon = s.icon;
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
            style={{ color: s.color, background: s.bg, borderColor: s.border }}>
            <Icon size={11} />
            {s.label}
        </span>
    );
};

// ── Form Field ───────────────────────────────────
const Field = ({ label, icon: Icon, placeholder, value, onChange, name, type = 'text' }) => (
    <div className="group">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 group-focus-within:text-sage-500 transition-colors duration-300 mb-2">
            {label}
        </label>
        <div className="relative">
            <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-sage-500 transition-colors z-10" />
            <input
                type={type} name={name} value={value} onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-700 outline-none focus:border-sage-600/50 focus:bg-white/[0.07] transition-all duration-300 text-sm font-medium"
            />
        </div>
    </div>
);

// ── Main Component ───────────────────────────────
const FarmerDashboard = ({ user }) => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ cropName: '', quantity: '', location: '' });
    const [file, setFile] = useState(null);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { scrollY } = useScroll();
    const navBg = useTransform(scrollY, [0, 50], ['rgba(6,12,5,0)', 'rgba(6,12,5,0.95)']);

    useEffect(() => { fetchBatches(); }, [user]);

    const fetchBatches = async () => {
        try {
            const res = await api.get('/api/batches/my');
            setBatches(res.data);
        } catch (err) { console.error(err); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        if (!formData.cropName || !formData.quantity || !formData.location) {
            toast.error('Please complete all harvest details'); return;
        }
        if (!file) { toast.error('Please attach an inspection certificate'); return; }
        setLoading(true);
        const data = new FormData();
        data.append('cropName', formData.cropName);
        data.append('quantity', formData.quantity);
        data.append('location', formData.location);
        data.append('isDemo', isDemoMode);
        data.append('document', file);
        try {
            await api.post('/api/batches', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Crop batch submitted for certification!');
            setShowForm(false);
            setFormData({ cropName: '', quantity: '', location: '' });
            setFile(null); setIsDemoMode(false);
            fetchBatches();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to create batch');
        } finally { setLoading(false); }
    };

    const handleStartAuction = async (batchId) => {
        const inputPrice = window.prompt('Set Starting Reserve Price ($):', '500');
        if (inputPrice === null) return;
        const startingPrice = Number(inputPrice) || 500;
        try {
            await api.post('/api/auction/start', { batchId, startingPrice });
            toast.success(`Auction activated at $${startingPrice.toLocaleString()}!`);
            fetchBatches();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Could not start auction');
        }
    };

    const loadDemoMode = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/system/demo-certificate');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${baseUrl}${res.data.file}`);
            const blob = await response.blob();
            setFile(new File([blob], 'demo-certificate.png', { type: 'image/png' }));
            setFormData({ cropName: 'Basmati Rice', quantity: '5 kg', location: 'Mumbai, IN' });
            setIsDemoMode(true);
            toast.success('Demo: Welcome Demo Farmer!');
        } catch { toast.error('Failed to load demo'); }
        finally { setLoading(false); }
    };

    const filtered = batches.filter(b =>
        b.cropName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const certified = batches.filter(b => b.status === 'certified').length;
    const active = batches.filter(b => b.auctionStatus === 'active').length;

    return (
        <div className="min-h-screen bg-[#060c05] text-white font-sans overflow-x-hidden">

            {/* ── Background ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(rgba(132,177,121,0.12) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    opacity: 0.4,
                }} />
                <div className="absolute inset-0 bg-gradient-to-b from-[#060c05] via-transparent to-[#060c05]" />
                <motion.div
                    className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(132,177,121,0.06) 0%, transparent 70%)' }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(162,203,139,0.04) 0%, transparent 70%)' }} />
            </div>

            {/* ── Top Nav ── */}
            <motion.header
                style={{ background: navBg }}
                className="fixed top-0 left-0 right-0 z-50 border-b border-transparent backdrop-blur-xl"
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo + context */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-sage-600/15 border border-sage-600/25">
                                <Leaf size={15} className="text-sage-500" />
                            </div>
                            <span className="font-black tracking-tight">Agri<span className="text-sage-500">Cert</span></span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 text-gray-600">
                            <ChevronRight size={14} />
                            <span className="text-sm font-medium text-gray-500">Farmer Portal</span>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="hidden md:flex items-center gap-2 w-64 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2">
                        <Search size={14} className="text-gray-600" />
                        <input
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search batches..."
                            className="bg-transparent text-sm text-white placeholder-gray-600 outline-none flex-1"
                        />
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] hover:border-white/15 transition-colors">
                            <Bell size={14} className="text-gray-500" />
                        </button>
                        <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.06]">
                            <div className="w-8 h-8 rounded-lg bg-sage-600/20 border border-sage-600/30 flex items-center justify-center">
                                <Wheat size={14} className="text-sage-500" />
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-bold text-white leading-none">{user?.name || 'Farmer'}</p>
                                <p className="text-[10px] text-gray-600 font-mono">Farmer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* ── Page Content ── */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">

                {/* ── Page Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10"
                >
                    <div>
                        {/* Live chip */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-600/10 border border-sage-600/20 mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-600" />
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-sage-400">Network Online</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
                            Harvest <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 to-sage-300">Command</span>
                        </h1>
                        <p className="text-gray-500 text-sm max-w-md">
                            Welcome back, <span className="text-sage-400 font-semibold">{user?.name || 'Farmer'}</span>. Manage certified crops, submit batches, and activate live auctions.
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(132,177,121,0.3)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-sage-600 text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(132,177,121,0.2)] hover:bg-sage-500 transition-all duration-300"
                    >
                        <Plus size={18} /> Register New Batch
                    </motion.button>
                </motion.div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <StatCard label="Total Batches" value={batches.length} sub="Registered crops" icon={Package} delay={0} />
                    <StatCard label="Certified" value={certified} sub="Quality verified" icon={ShieldCheck} delay={0.08} />
                    <StatCard label="Live Auctions" value={active} sub="Active on market" icon={Play} delay={0.16} />
                    <StatCard label="Success Rate" value={batches.length ? `${Math.round((certified / batches.length) * 100)}%` : '—'} sub="Certification rate" icon={TrendingUp} delay={0.24} />
                </div>

                {/* ── Batch Grid ── */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black tracking-tight flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sage-600/15 border border-sage-600/25 flex items-center justify-center">
                            <Package size={13} className="text-sage-500" />
                        </div>
                        Crop Archive
                        {batches.length > 0 && (
                            <span className="text-xs font-bold text-gray-600 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-lg">
                                {batches.length}
                            </span>
                        )}
                    </h2>
                    {/* Mobile search */}
                    <div className="flex md:hidden items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5">
                        <Search size={12} className="text-gray-600" />
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search..." className="bg-transparent text-xs text-white placeholder-gray-600 outline-none w-24" />
                    </div>
                </div>

                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="col-span-full py-32 flex flex-col items-center justify-center text-center rounded-3xl border border-white/[0.05] bg-white/[0.015]"
                        >
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6"
                            >
                                <Package size={36} strokeWidth={1} className="text-sage-600/30" />
                            </motion.div>
                            <p className="font-black text-white/20 text-sm uppercase tracking-widest mb-2">
                                {searchQuery ? 'No matches found' : 'No batches registered'}
                            </p>
                            <p className="text-xs text-gray-700">
                                {searchQuery ? 'Try a different search term' : 'Register your first crop batch to get started'}
                            </p>
                            {!searchQuery && (
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setShowForm(true)}
                                    className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-sage-600/15 border border-sage-600/25 rounded-xl text-sage-400 font-bold text-sm hover:bg-sage-600/25 transition-all"
                                >
                                    <Plus size={16} /> Register Batch
                                </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {filtered.map((batch, i) => (
                                <BatchCard key={batch._id} batch={batch} index={i} onStartAuction={handleStartAuction} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Register Form Modal ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030602]/85 backdrop-blur-xl"
                        onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.94, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.94, y: 30, opacity: 0 }}
                            transition={{ duration: 0.4, ease }}
                            className="w-full max-w-4xl bg-[#080f07] border border-white/[0.07] rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.7)] relative"
                        >
                            {/* Top accent line */}
                            <div className="h-[2px] bg-gradient-to-r from-transparent via-sage-600/60 to-transparent" />

                            {/* Modal header */}
                            <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.05]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-sage-600/15 border border-sage-600/25 flex items-center justify-center">
                                        <Wheat size={18} className="text-sage-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono text-sage-600 uppercase tracking-widest mb-0.5">New Registration</p>
                                        <h2 className="text-lg font-black text-white">Register Crop Batch</h2>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isDemoMode && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                                            <Zap size={10} fill="currentColor" /> Demo Mode
                                        </span>
                                    )}
                                    <button onClick={() => { setShowForm(false); setIsDemoMode(false); }}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-400 text-gray-500 transition-all">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Form body */}
                            <form onSubmit={handleCreateBatch} noValidate>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                                    {/* Left — Fields */}
                                    <div className="flex flex-col gap-5">
                                        <Field label="Crop Variety & Name" icon={Wheat} placeholder="e.g. Premium Basmati v4"
                                            name="cropName" value={formData.cropName} onChange={handleChange} />
                                        <Field label="Harvest Quantity" icon={Scale} placeholder="e.g. 1.2 Metric Tons"
                                            name="quantity" value={formData.quantity} onChange={handleChange} />
                                        <Field label="Farm Location" icon={MapPin} placeholder="e.g. Kashmir Valley, IN"
                                            name="location" value={formData.location} onChange={handleChange} />

                                        {/* Demo quick-fill */}
                                        <div>
                                            <p className="text-[10px] font-mono text-gray-700 uppercase tracking-widest mb-2">Quick Fill</p>
                                            <button type="button" onClick={loadDemoMode} disabled={loading}
                                                className="w-full py-2.5 rounded-lg bg-sage-600/10 border border-sage-600/20 text-xs font-bold text-sage-500 hover:bg-sage-600/20 transition-all flex items-center justify-center gap-1.5">
                                                <Zap size={11} fill="currentColor" /> Load Demo Certificate
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right — File Drop */}
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                                            Inspection Certificate (PDF / PNG / JPG)
                                        </p>
                                        <label className="group flex-1 relative flex flex-col items-center justify-center min-h-[220px] rounded-2xl border-2 border-dashed border-white/[0.07] hover:border-sage-600/35 bg-white/[0.02] hover:bg-sage-600/[0.03] transition-all duration-400 cursor-pointer overflow-hidden">
                                            {/* bg glow on hover */}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                style={{ background: 'radial-gradient(circle at center, rgba(132,177,121,0.05), transparent 70%)' }} />
                                            <div className="relative z-10 flex flex-col items-center gap-3 text-center p-6">
                                                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] group-hover:border-sage-600/30 group-hover:bg-sage-600/10 flex items-center justify-center transition-all duration-400">
                                                    {file ? <FileText size={24} className="text-sage-500" /> : <Upload size={24} className="text-gray-600 group-hover:text-sage-500" strokeWidth={1.5} />}
                                                </div>
                                                {file ? (
                                                    <div>
                                                        <p className="font-bold text-sage-400 text-sm">{file.name}</p>
                                                        <p className="text-xs text-gray-600 mt-1">Click to replace</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="font-bold text-white/60 text-sm">Drop file here</p>
                                                        <p className="text-xs text-gray-600 mt-1">or click to browse</p>
                                                    </div>
                                                )}
                                            </div>
                                            <input type="file" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </label>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-8 pb-8">
                                    <motion.button
                                        type="submit" disabled={loading}
                                        whileHover={{ scale: 1.01, boxShadow: '0 0 30px rgba(132,177,121,0.3)' }}
                                        whileTap={{ scale: 0.99 }}
                                        className="w-full py-4 bg-sage-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(132,177,121,0.2)] hover:bg-sage-500 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {loading
                                            ? <Loader2 size={18} className="animate-spin" />
                                            : <><Sparkles size={16} /> Submit for AI Certification</>
                                        }
                                    </motion.button>
                                    <p className="text-center text-[10px] text-gray-700 font-mono mt-3 uppercase tracking-widest">
                                        Secured · Polygon Blockchain · OCR AI Analysis
                                    </p>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Batch Card ───────────────────────────────────
const BatchCard = ({ batch, index, onStartAuction }) => {
    const s = STATUS[batch.status] || STATUS.pending;
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.08, ease }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080f07]/80 hover:border-sage-600/20 transition-all duration-500"
        >
            {/* Top color accent */}
            <div className="h-[2px] bg-gradient-to-r from-transparent to-transparent"
                style={{ backgroundImage: `linear-gradient(to right, transparent, ${s.color}60, transparent)` }} />

            {/* Hover glow */}
            <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(circle at top right, ${s.color}08, transparent 70%)` }} />

            <div className="relative z-10 p-6">

                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                            style={{ background: `${s.color}15`, borderColor: `${s.color}30` }}>
                            <Wheat size={18} style={{ color: s.color }} />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-lg leading-tight">{batch.cropName}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-[10px] font-mono text-gray-600">ID: ...{batch._id.slice(-8)}</p>
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
                    </div>
                    <StatusBadge status={batch.status} />
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                        { icon: Scale, label: 'Quantity', value: batch.quantity },
                        { icon: MapPin, label: 'Origin', value: batch.location },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] group-hover:border-white/[0.07] transition-colors">
                            <Icon size={14} className="text-gray-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-0.5">{label}</p>
                                <p className="text-sm font-bold text-white truncate">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Blockchain hash */}
                {batch.blockchainHash && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl border border-white/[0.04] bg-black/20 mb-5 group/hash hover:border-sage-600/20 transition-colors">
                        <Hash size={13} className="text-gray-700 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-0.5">On-chain proof</p>
                            <p className="text-[10px] font-mono text-gray-600 group-hover/hash:text-sage-500 transition-colors truncate">{batch.blockchainHash}</p>
                        </div>
                    </div>
                )}

                {/* Action */}
                {batch.status === 'certified' && batch.auctionStatus !== 'active' ? (
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(132,177,121,0.25)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onStartAuction(batch._id)}
                        className="w-full py-3 bg-sage-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-sage-500 transition-all duration-300 shadow-[0_0_16px_rgba(132,177,121,0.15)]"
                    >
                        <Play size={15} fill="currentColor" /> Start Live Auction
                    </motion.button>
                ) : batch.auctionStatus === 'active' ? (
                    <div className="w-full py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold"
                        style={{ color: '#84B179', borderColor: 'rgba(132,177,121,0.25)', background: 'rgba(132,177,121,0.07)' }}>
                        <span className="w-2 h-2 rounded-full bg-sage-600 animate-pulse" />
                        Live on Market
                    </div>
                ) : (
                    <div className="w-full py-3 rounded-xl border border-white/[0.05] text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Awaiting Certification
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default FarmerDashboard;
