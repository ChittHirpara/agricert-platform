import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Upload, Play, Package, Loader2, Leaf, ShieldCheck, Link as LinkIcon, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const FarmerDashboard = ({ user }) => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        cropName: '',
        quantity: '',
        location: ''
    });
    const [file, setFile] = useState(null);
    const [isDemoMode, setIsDemoMode] = useState(false);

    useEffect(() => {
        fetchBatches();
    }, [user]);

    const fetchBatches = async () => {
        try {
            const res = await api.get('/api/batches/my');
            setBatches(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();

        // Manual Validation
        if (!formData.cropName || !formData.quantity || !formData.location) {
            toast.error('Please complete all harvest details');
            return;
        }
        if (!file) {
            toast.error('Please attach an inspection certificate');
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append('cropName', formData.cropName);
        data.append('quantity', formData.quantity);
        data.append('location', formData.location);
        data.append('isDemo', isDemoMode);
        if (file) data.append('document', file);

        try {
            await api.post('/api/batches', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Crop batch submitted for certification!');
            setShowForm(false);
            setFormData({ cropName: '', quantity: '', location: '' });
            setFile(null);
            setIsDemoMode(false);
            fetchBatches();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || 'Failed to create batch');
        } finally {
            setLoading(false);
        }
    };

    const handleStartAuction = async (batchId) => {
        const inputPrice = window.prompt("Set Starting Reserve Price ($):", "500");
        if (inputPrice === null) return; // Cancelled

        const startingPrice = Number(inputPrice) || 500;

        try {
            await api.post('/api/auction/start', { batchId, startingPrice });
            toast.success(`Auction activated at $${startingPrice.toLocaleString()}!`);
            fetchBatches();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || 'Could not start auction');
        }
    };

    return (
        <div className="min-h-screen bg-[#04140a] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-green-500/10 blur-[150px] rounded-full rotate-45"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#04140a] to-[#04140a]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/80">Network Online</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
                            Farmer<span className="text-emerald-500 italic font-medium ml-1">Portal.</span>
                        </h1>
                        <p className="text-gray-400 font-medium max-w-xl text-lg leading-relaxed">
                            Welcome back, {user?.name || 'Farmer'}. Manage your digital harvest and verify purity via AI and blockchain.
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowForm(!showForm)}
                        className={`relative group px-8 py-4 rounded-2xl overflow-hidden transition-all duration-500 flex items-center gap-3 font-bold shadow-xl ${showForm
                            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                            : 'bg-[#0A1A0F] border border-emerald-500/30 text-white'
                            }`}
                    >
                        {!showForm && <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-500/20 group-hover:opacity-100 transition-opacity"></div>}
                        {showForm ? 'Cancel Registration' : <><Plus size={20} className="text-emerald-400" /> Register New Batch</>}
                    </motion.button>
                </motion.div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {[
                        { label: 'Total Registered Crops', value: batches.length, icon: Package, color: 'emerald', detail: 'Cumulative Yield' },
                        { label: 'Certified Batches', value: batches.filter(b => b.status === 'certified').length, icon: ShieldCheck, color: 'blue', detail: 'Quality Verified' },
                        { label: 'Active Auctions', value: batches.filter(b => b.auctionStatus === 'active').length, icon: Play, color: 'teal', detail: 'Market Liquidity' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * i, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 hover:border-emerald-500/30 transition-all duration-700 group relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/50 mb-4">{stat.label}</p>
                                <div className="text-6xl font-black text-white tracking-tighter flex items-baseline gap-3 mb-2">
                                    {stat.value}
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{stat.detail}</span>
                                </div>
                            </div>
                            <stat.icon className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/[0.03] group-hover:text-emerald-500/[0.05] transition-all duration-1000 group-hover:rotate-12" strokeWidth={0.5} />
                        </motion.div>
                    ))}
                </div>

                {/* Bespoke Form Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            animate={{ opacity: 1, backdropFilter: 'blur(40px)' }}
                            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-[#020804]/90"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 40 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="w-full max-w-5xl bg-[#061008] border border-white/5 rounded-[56px] p-12 md:p-16 relative overflow-hidden shadow-[0_60px_150px_-40px_rgba(0,0,0,0.8)]"
                            >
                                {/* Form Background Detailing */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
                                <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                                    <Leaf size={240} className="text-emerald-500" strokeWidth={0.5} />
                                </div>

                                <button
                                    onClick={() => { setShowForm(false); setIsDemoMode(false); }}
                                    className="absolute top-8 right-8 w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-400/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-500 z-[130] group backdrop-blur-xl"
                                >
                                    <Plus size={32} className="rotate-45 group-hover:scale-125 transition-all duration-500" />
                                </button>

                                <div className="mb-16 relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500/60">Harvest Registration</span>
                                    </div>
                                    <h2 className="text-5xl font-black text-white tracking-tighter mb-4 flex items-baseline gap-3 leading-[1.1]">
                                        Register <span className="text-emerald-500 italic font-medium">Batch.</span>
                                    </h2>
                                </div>

                                <form noValidate onSubmit={handleCreateBatch} className="grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
                                    <div className="space-y-12">
                                        {[
                                            { label: 'Crop Variety & Name', key: 'cropName', placeholder: 'e.g. Premium Basmati v4' },
                                            { label: 'Harvest Quantity', key: 'quantity', placeholder: 'e.g. 1.2 Metric Tons' },
                                            { label: 'Farm Location', key: 'location', placeholder: 'e.g. Kashmir Valley, IN' }
                                        ].map((field, i) => (
                                            <div key={i} className="group relative">
                                                <label className="block text-[11px] font-bold uppercase tracking-[0.4em] text-gray-500 mb-5 group-focus-within:text-emerald-500 transition-colors duration-500">{field.label}</label>
                                                <input
                                                    type="text" placeholder={field.placeholder}
                                                    className="w-full bg-transparent border-b border-white/[0.08] outline-none font-black text-2xl text-white placeholder:text-white/5 focus:border-emerald-500 transition-all duration-700 py-3 uppercase tracking-tight"
                                                    value={formData[field.key]} onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                />
                                            </div>
                                        ))}

                                        {/* Demo Testing Suite */}
                                        <div className="pt-6 space-y-6">
                                            <div className="flex items-center justify-between mb-4 px-1">
                                                <p className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-emerald-500/40">Judge Testing Suite</p>
                                                {isDemoMode && (
                                                    <motion.span
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5"
                                                    >
                                                        <Zap size={10} fill="currentColor" /> ⚡ Demo Mode for Judges
                                                    </motion.span>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                <button
                                                    type="button"
                                                    disabled={loading}
                                                    onClick={async () => {
                                                        try {
                                                            setLoading(true);
                                                            const res = await api.get('/api/system/demo-certificate');
                                                            const demoPath = res.data.file;
                                                            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                                                            const response = await fetch(`${baseUrl}${demoPath}`);
                                                            const blob = await response.blob();
                                                            const demoFile = new File([blob], "demo-certificate.png", { type: "image/png" });
                                                            setFile(demoFile);
                                                            setFormData({
                                                                cropName: 'Premium Basmati v4',
                                                                quantity: '1.2 Metric Tons',
                                                                location: 'Kashmir Valley, IN'
                                                            });
                                                            setIsDemoMode(true);
                                                            toast.success('Sample certificate attached in Demo Mode!');
                                                        } catch (err) {
                                                            toast.error('Failed to load sample asset');
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }}
                                                    className="group flex items-center justify-between w-full p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all duration-500"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Zap size={18} className="text-emerald-400" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">Instant Demo Mode</p>
                                                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Auto-fill & Attach Sample Certificate</p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight size={16} className="text-emerald-500/40 group-hover:translate-x-1 transition-transform" />
                                                </button>

                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ cropName: 'Premium Basmati', quantity: '10 Tons', location: 'Punjab, IN' })}
                                                        className="flex-1 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[8px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-400 hover:border-emerald-500/20 transition-all"
                                                    >
                                                        Quick Basmati
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ cropName: 'Organic Wheat', quantity: '4.5 Tons', location: 'Kansas, US' })}
                                                        className="flex-1 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[8px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-400 hover:border-emerald-500/20 transition-all"
                                                    >
                                                        Quick Wheat
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col h-full">
                                        <label className="block text-[11px] font-bold uppercase tracking-[0.4em] text-gray-500 mb-5 font-sans">Inspection Certificate (Digital Proof)</label>
                                        <div className="flex-1 relative group/dropzone min-h-[280px]">
                                            <div className="absolute inset-0 bg-white/[0.01] border-2 border-dashed border-white/[0.05] rounded-[40px] group-hover/dropzone:bg-emerald-500/[0.02] group-hover/dropzone:border-emerald-500/30 transition-all duration-1000 shadow-inner"></div>
                                            <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-center cursor-pointer">
                                                <div className="w-20 h-20 rounded-[30px] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 group-hover/dropzone:scale-110 group-hover/dropzone:bg-emerald-500/10 transition-all duration-1000 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.2)]">
                                                    <Upload size={28} className="text-gray-500 group-hover/dropzone:text-emerald-400" strokeWidth={1.5} />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[12px] font-black text-white uppercase tracking-[0.3em] group-hover/dropzone:text-emerald-400 transition-colors">DEPOSIT DOCUMENT</p>
                                                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest max-w-[200px] leading-relaxed">System supports PDF, PNG & JPG Certificate structures</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    onChange={e => setFile(e.target.files[0])}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                {file && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-8 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-[10px] font-mono font-black flex items-center gap-3"
                                                    >
                                                        <Package size={14} /> {file.name.toUpperCase()}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.01, translateY: -2 }}
                                            whileTap={{ scale: 0.99 }}
                                            type="submit" disabled={loading}
                                            className="mt-12 w-full py-7 rounded-[28px] bg-white text-black font-black text-xs uppercase tracking-[0.6em] shadow-[0_40px_80px_-20px_rgba(255,255,255,0.15)] hover:bg-emerald-400 transition-all duration-700 disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : 'Execute Minting Sequence'}
                                        </motion.button>

                                        <p className="mt-6 text-center text-[8px] font-mono text-slate-700 uppercase tracking-[0.4em] font-black italic">
                                            Secured by AgriCert Purity Consensus Node v4.0.0
                                        </p>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Batches Grid */}
                <h3 className="text-xl font-black text-white mb-10 tracking-tight italic flex items-center gap-3 uppercase">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Package size={16} className="text-emerald-400" />
                    </div>
                    Crop <span className="text-emerald-400 italic font-normal not-italic ml-1">Archive</span>
                </h3>

                <motion.div
                    layout
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {batches.length === 0 ? (
                        <div className="col-span-full py-64 flex flex-col items-center border border-white/5 rounded-[56px] bg-white/[0.01] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent"></div>
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mb-10 border border-white/5"
                            >
                                <Package size={48} className="text-emerald-500/20" strokeWidth={0.5} />
                            </motion.div>
                            <p className="text-[12px] font-black uppercase tracking-[0.5em] text-emerald-500/30">Vault Substrate Empty</p>
                            <p className="text-[10px] text-gray-700 font-bold mt-4 uppercase tracking-widest">Awaiting digital registration sequence</p>
                        </div>
                    ) : (
                        batches.map((batch, index) => (
                            <motion.div
                                layout
                                key={batch._id}
                                initial={{ opacity: 0, scale: 0.98, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: index * 0.12, duration: 1, ease: [0.19, 1, 0.22, 1] }}
                                className="group relative bg-[#040c06]/80 backdrop-blur-3xl border border-white/[0.03] rounded-[48px] p-10 hover:border-emerald-500/30 transition-all duration-1000 overflow-hidden shadow-[0_40px_100px_-30px_rgba(0,0,0,0.4)]"
                            >
                                {/* Precise Inner Glow Ring */}
                                <div className="absolute inset-0 rounded-[48px] border border-white/[0.02] pointer-events-none"></div>
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/[0.03] blur-[100px] rounded-full pointer-events-none group-hover:bg-emerald-500/[0.08] transition-all duration-[1.2s]"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <h4 className="text-4xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors duration-700 leading-none">{batch.cropName}</h4>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-all duration-700 shadow-[0_0_12px_rgba(16,185,129,0)] group-hover:shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-bold text-gray-500 lowercase tracking-tight">ID: {batch._id.slice(-8)}</span>
                                            </div>
                                        </div>

                                        <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-3xl border ${batch.status === 'certified'
                                            ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-[0_10px_30px_-5px_rgba(16,185,129,0.2)]'
                                            : batch.status === 'rejected'
                                                ? 'bg-red-500/5 text-red-400 border-red-500/20 shadow-[0_10px_30px_-5px_rgba(239,68,68,0.2)]'
                                                : 'bg-white/5 text-slate-500 border-white/5 animate-pulse'
                                            }`}>
                                            {batch.status}
                                        </div>
                                    </div>

                                    {/* High-Contrast Info Strip */}
                                    <div className="grid grid-cols-2 gap-4 mb-12">
                                        <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.02] group-hover:bg-white/[0.02] group-hover:border-emerald-500/10 transition-all duration-[1s]">
                                            <span className="block text-[11px] font-bold text-gray-500 mb-4">Total Quantity</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black text-white tracking-tight">{batch.quantity.split(' ')[0]}</span>
                                                <span className="text-xs font-bold text-emerald-500/40 uppercase tracking-tighter">{batch.quantity.split(' ')[1] || 'kg'}</span>
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.02] group-hover:bg-white/[0.02] group-hover:border-emerald-500/10 transition-all duration-[1s]">
                                            <span className="block text-[11px] font-bold text-gray-500 mb-4">Origin Provenance</span>
                                            <span className="text-2xl font-black text-white tracking-tight block truncate">{batch.location}</span>
                                        </div>
                                    </div>

                                    {/* Cryptographic Ledger Ref */}
                                    {batch.blockchainHash && (
                                        <div className="mb-12 px-8 py-6 bg-black/40 rounded-[28px] border border-emerald-500/[0.05] group-hover:border-emerald-500/20 transition-all duration-1000 group/hash">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">Blockchain Ledger Proof</span>
                                            </div>
                                            <p className="text-[10px] text-gray-600 break-all leading-relaxed group-hover/hash:text-emerald-400/80 transition-colors font-medium">{batch.blockchainHash}</p>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        {batch.status === 'certified' && batch.auctionStatus !== 'active' ? (
                                            <motion.button
                                                whileHover={{ scale: 1.01, translateY: -2 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => handleStartAuction(batch._id)}
                                                className="w-full py-6 rounded-[24px] bg-white text-black font-black text-xs tracking-[0.4em] uppercase transition-all duration-700 hover:bg-emerald-400 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)]"
                                            >
                                                Initiate Market Auction
                                            </motion.button>
                                        ) : batch.auctionStatus === 'active' ? (
                                            <div className="w-full py-6 text-emerald-400 font-black text-[10px] tracking-[0.45em] uppercase text-center bg-emerald-500/5 border border-emerald-500/10 rounded-[24px] shadow-inner">
                                                Live Ledger Exchange
                                            </div>
                                        ) : (
                                            <div className="w-full py-6 text-gray-600 text-[10px] tracking-widest uppercase text-center bg-white/[0.01] border border-white/[0.02] rounded-[24px] font-bold italic">
                                                Awaiting Manual Authentication
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default FarmerDashboard;
