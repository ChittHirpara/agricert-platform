import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    Upload, FileText, CheckCircle, ShieldCheck, Box, Search,
    ArrowRight, Zap, Info, Database, Cpu, Lightbulb, Star, Loader2, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CertifierDashboard = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [ocrData, setOcrData] = useState(null);
    const [isApproving, setIsApproving] = useState(false);
    const [blockchainHash, setBlockchainHash] = useState(null);

    // Timeline steps
    const steps = [
        { title: 'Upload', icon: Upload },
        { title: 'OCR Scan', icon: FileText },
        { title: 'Approved', icon: CheckCircle },
        { title: 'Blockchain', icon: ShieldCheck }
    ];

    // Derive current step based on state
    const getCurrentStepIndex = () => {
        if (blockchainHash) return 3;
        if (ocrData) return 2;
        if (isScanning) return 1;
        if (selectedBatch) return 0;
        return -1;
    };

    const currentStepIndex = getCurrentStepIndex();

    useEffect(() => {
        fetchPendingBatches();
    }, []);

    const fetchPendingBatches = async () => {
        try {
            const res = await api.get('/api/batches/pending');
            setBatches(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleOcrScan = async () => {
        if (!selectedFile && !selectedBatch?.documentUrl) return;
        setIsScanning(true);

        try {
            let res;
            if (selectedFile) {
                const formData = new FormData();
                formData.append('document', selectedFile);
                formData.append('isDemo', !!selectedBatch?.isDemo);
                res = await api.post('/api/ocr/scan', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Use existing document from the batch
                res = await api.post('/api/ocr/scan',
                    { existingFilePath: selectedBatch.documentUrl, isDemo: !!selectedBatch.isDemo },
                    { headers: { 'Content-Type': 'application/json' } }
                );
            }
            setOcrData(res.data.ocrData);
        } catch (error) {
            console.error('OCR Error', error);
            const message = error.response?.data?.error || error.response?.data?.msg || 'Failed to scan document';
            toast.error(message);
        } finally {
            setIsScanning(false);
        }
    };

    const handleApproveAndStore = async () => {
        if (!selectedBatch || !ocrData) return;
        setIsApproving(true);

        try {
            const res = await api.post('/api/certifications/approve', {
                batchId: selectedBatch._id,
                ocrData: ocrData
            });

            setBlockchainHash(res.data.batch?.blockchainHash || 'stored');
            toast.success('Certificate minted successfully on blockchain!');

            // Update local UI
            const updatedBatches = batches.filter(b => b._id !== selectedBatch._id);
            setBatches(updatedBatches);

        } catch (error) {
            console.error('Certification Error', error);
            toast.error(error.response?.data?.msg || 'Failed to approve certification');
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!selectedBatch) return;
        try {
            await api.post('/api/certifications/reject', {
                batchId: selectedBatch._id,
                reason: 'Quality standards not met'
            });
            const updatedBatches = batches.filter(b => b._id !== selectedBatch._id);
            setBatches(updatedBatches);
            setSelectedBatch(null);
            setOcrData(null);
            setBlockchainHash(null);
            setSelectedFile(null);
            toast.success('Batch rejected successfully');
        } catch (error) {
            console.error('Rejection Error', error);
            toast.error(error.response?.data?.msg || 'Failed to reject batch');
        }
    };



    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 animate-fadeIn min-h-screen">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">Node Alpha-12</span>
                    </div>
                    <h1 className="text-7xl font-black text-white tracking-tighter leading-none">Certifier <span className="text-emerald-500 italic font-medium">Terminal.</span></h1>
                    <p className="text-gray-500 font-medium max-w-2xl text-lg leading-relaxed">Advanced provenance analysis with real-time neural consensus and blockchain finality.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="px-6 py-3 bg-[#081a0b] border border-emerald-500/20 rounded-[20px] flex items-center gap-4 shadow-2xl backdrop-blur-3xl">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                        </div>
                        <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] font-mono">Consensus: Online</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column - Submission Feed */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-[#051107] rounded-[48px] shadow-2xl border border-white/5 overflow-hidden group">
                        <div className="px-10 py-8 border-b border-white/5 bg-gradient-to-r from-emerald-500/[0.05] to-transparent flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Box size={26} className="text-emerald-500 group-hover:rotate-12 transition-transform duration-500" />
                                <h3 className="font-black text-white tracking-tight text-2xl uppercase italic">Payloads</h3>
                            </div>
                            <span className="bg-white/5 text-emerald-400 text-[11px] font-black px-5 py-2 rounded-full border border-white/10">{batches.length} ACTIVE</span>
                        </div>
                        <div className="divide-y divide-white/[0.03] max-h-[600px] overflow-y-auto custom-scrollbar bg-black/20">
                            {batches.map(batch => (
                                <div
                                    key={batch._id}
                                    onClick={() => { setSelectedBatch(batch); setOcrData(null); setBlockchainHash(null); setSelectedFile(null); setPreviewUrl(null); }}
                                    className={`p-6 cursor-pointer transition-all duration-700 relative group/item ${selectedBatch?._id === batch._id ? 'bg-emerald-500/10' : 'hover:bg-white/[0.02]'}`}
                                >
                                    {selectedBatch?._id === batch._id && (
                                        <motion.div layoutId="active-pill" className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                                    )}
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-black text-white text-lg leading-tight tracking-tight italic uppercase group-hover/item:text-emerald-400 transition-colors">{batch.cropName}</h4>
                                        <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.1em] bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                            Pending
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">{batch.farmerId?.name || 'Anon'}</p>
                                        <p className="text-[10px] text-gray-400 flex items-center gap-2 font-medium opacity-60"><Package size={12} className="text-emerald-500" /> {batch.quantity} • {batch.location}</p>
                                    </div>
                                </div>
                            ))}
                            {batches.length === 0 && (
                                <div className="p-16 text-center text-gray-400">
                                    <CheckCircle size={48} className="mx-auto text-emerald-100 mb-4" strokeWidth={1} />
                                    <p className="font-black text-gray-900 text-lg tracking-tight">Queue Depleted</p>
                                    <p className="text-xs font-medium mt-1">All batches verified.</p>
                                </div>
                            )}
                        </div>
                    </div>


                </div>

                <div className="lg:col-span-8 min-h-[700px]">
                    <AnimatePresence mode="wait">
                        {selectedBatch || selectedFile || ocrData ? (
                            <motion.div
                                key="terminal-active"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={{ duration: 0.5, ease: "circOut" }}
                                className="bg-[#040c06]/80 backdrop-blur-3xl border border-white/[0.03] rounded-[56px] p-12 min-h-[700px] flex flex-col relative overflow-hidden shadow-[0_60px_150px_-40px_rgba(0,0,0,0.8)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none"></div>



                                {/* Timeline UI */}
                                <div className="mb-12">
                                    <div className="flex items-center justify-between relative px-4">
                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-[2px] bg-gray-100 -z-10"></div>
                                        <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-[2px] bg-green-500 -z-10 transition-all duration-700 ease-in-out`} style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}></div>

                                        {steps.map((step, idx) => {
                                            const isCompleted = currentStepIndex >= idx;
                                            const isCurrent = currentStepIndex === idx;
                                            const Icon = step.icon;
                                            return (
                                                <div key={idx} className="flex flex-col items-center">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all duration-500 ${isCompleted ? 'bg-green-600 text-white scale-110' : isCurrent ? 'bg-green-50 text-green-600 border-green-200 ring-4 ring-green-50 shadow-green-200' : 'bg-gray-50 text-gray-300'}`}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <span className={`text-[10px] mt-3 font-black uppercase tracking-widest ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Step 1: Initiation - CONTEXT AWARE */}
                                {!ocrData && !blockchainHash && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 flex-1 flex flex-col justify-center relative z-10">
                                        {selectedBatch ? (
                                            // Real Workflow: Analyze Submitted Batch
                                            <div className="text-center space-y-12">
                                                <div className="space-y-4">
                                                    <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Authentication <span className="text-emerald-500">Pipeline.</span></h3>
                                                    <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed text-sm">Verify the proof of quality submitted by <span className="text-emerald-400 font-black tracking-widest uppercase text-xs">{selectedBatch.farmerId?.name || 'Farmer'}</span> for digital finality.</p>
                                                </div>

                                                <div className="flex flex-col items-center">
                                                    <div className="w-full max-w-lg bg-[#081a0b] border border-emerald-500/20 rounded-[48px] p-12 flex flex-col items-center gap-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden group/init">
                                                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[100px] rounded-full -mr-24 -mt-24 group-hover:bg-emerald-500/10 transition-all duration-1000"></div>

                                                        <div className="w-32 h-32 bg-white/[0.03] rounded-[40px] flex items-center justify-center border border-white/10 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 relative z-10">
                                                            <FileText className="text-emerald-400" size={56} strokeWidth={1} />
                                                        </div>

                                                        <div className="text-center relative z-10">
                                                            <h4 className="text-2xl font-black text-white mb-2 tracking-tight italic uppercase">Provenance Certificate</h4>
                                                            <div className="flex items-center justify-center gap-3">
                                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                                                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em]">Substrate Ready: ID-{selectedBatch._id.slice(-6)}</p>
                                                            </div>
                                                        </div>

                                                        <div className="w-full h-[1px] bg-white/5"></div>

                                                        <div className="w-full grid grid-cols-2 gap-8 relative z-10">
                                                            <div className="text-left">
                                                                <span className="block text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Species</span>
                                                                <span className="block text-xl font-black text-white italic tracking-tight">{selectedBatch.cropName}</span>
                                                            </div>
                                                            <div className="text-left border-l border-white/10 pl-8">
                                                                <span className="block text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Mass</span>
                                                                <span className="block text-xl font-black text-emerald-400 font-mono">{selectedBatch.quantity}</span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={handleOcrScan}
                                                            disabled={isScanning}
                                                            className="w-full py-6 bg-white text-black rounded-3xl font-black text-xs tracking-[0.5em] shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)] hover:bg-emerald-400 transition-all duration-500 flex items-center justify-center gap-4 disabled:opacity-50 uppercase relative z-10 hover:translate-y-[-4px]"
                                                        >
                                                            {isScanning ? <Loader2 className="animate-spin" size={24} /> : <><ShieldCheck size={24} /> Initiate Spectral Scan</>}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 flex items-start gap-6 max-w-xl mx-auto backdrop-blur-3xl">
                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                                        <Database className="text-emerald-400" size={22} />
                                                    </div>
                                                    <p className="text-[11px] text-gray-400 font-medium text-left leading-relaxed">
                                                        <strong className="block mb-2 font-black uppercase tracking-[0.4em] text-[10px] text-emerald-500/80">Neural Ledger Protocol</strong>
                                                        The system will perform a deep neural extraction of moisture coefficients, biomass consistency, and cryptographic origin markers for immutable certification.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            // Empty State: No batch selected
                                            <div className="text-center py-32 space-y-8">
                                                <div className="w-24 h-24 rounded-[32px] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-10 group">
                                                    <Database size={40} className="text-emerald-500/20 group-hover:text-emerald-500/50 transition-colors" strokeWidth={1} />
                                                </div>
                                                <h3 className="text-4xl font-black text-white tracking-widest uppercase italic opacity-20">Awaiting Payload</h3>
                                                <p className="text-gray-600 font-medium tracking-widest uppercase text-[10px]">Select a submission from the consensus feed to begin</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Step 2 & 3: Review OCR & Approve */}
                                {ocrData && !blockchainHash && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 flex-1 relative z-10">
                                        <div className="flex flex-col xl:flex-row gap-12">
                                            {/* Results Display */}
                                            <div className="flex-1 space-y-8">
                                                <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-10 backdrop-blur-3xl relative overflow-hidden group/data">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent"></div>
                                                    <div className="flex items-center justify-between mb-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover/data:rotate-6 transition-transform">
                                                                <Database size={24} className="text-emerald-400" />
                                                            </div>
                                                            <h4 className="text-2xl font-black text-white italic tracking-tight underline decoration-emerald-500/30 underline-offset-8">Spectral Data</h4>
                                                        </div>
                                                        <div className="flex items-center gap-3 px-5 py-2 bg-[#081a0b] border border-emerald-500/30 rounded-xl shadow-2xl">
                                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Confidence Matrix</span>
                                                            <span className="text-lg font-black text-white font-mono">{ocrData.confidence || '98'}%</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        {Object.entries(ocrData).filter(([key]) => !['rawText', 'prediction', 'confidence'].includes(key)).map(([key, value]) => (
                                                            <motion.div
                                                                key={key}
                                                                whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.04)' }}
                                                                className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 shadow-sm transition-all group/item"
                                                            >
                                                                <span className="block text-[8px] text-gray-500 uppercase font-black tracking-[0.3em] mb-2 group-hover/item:text-emerald-500 transition-colors">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                                <span className="block text-lg text-white font-bold group-hover/item:scale-105 transition-transform origin-left">{value}</span>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* AI Quality Substrate */}
                                                {ocrData.prediction && (
                                                    <div className="bg-gradient-to-br from-[#051107] to-black rounded-[40px] p-10 border border-emerald-500/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-10 opacity-5">
                                                            <Cpu size={120} className="text-emerald-500" />
                                                        </div>

                                                        <div className="flex items-center gap-4 mb-10">
                                                            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                                                <Cpu className="text-emerald-400 animate-pulse" size={28} />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-black text-xl text-white tracking-tight italic uppercase">Neural Quality Prognosis</h5>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                                                                    <p className="text-[10px] text-emerald-400/70 font-black uppercase tracking-[0.4em]">Engine Active: ResNet-152</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mb-10 p-8 bg-black/40 rounded-3xl border border-white/5">
                                                            <div className="flex justify-between items-end mb-4">
                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Certification Probability</span>
                                                                <span className="text-5xl font-black text-emerald-400 font-mono tracking-tighter">{Math.round(ocrData.prediction.probability * 100)}%</span>
                                                            </div>
                                                            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5 p-0.5">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${Math.round(ocrData.prediction.probability * 100)}%` }}
                                                                    transition={{ duration: 1.5, ease: "circOut" }}
                                                                    className="bg-gradient-to-r from-emerald-600 to-green-400 h-full rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 backdrop-blur-md">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                                                    <Lightbulb className="text-emerald-400" size={16} />
                                                                </div>
                                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">AI Consensus Decision</span>
                                                            </div>
                                                            <p className="text-lg text-white/90 font-medium leading-relaxed italic font-serif">
                                                                "{ocrData.prediction.suggestion}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Sidebar - High stakes summary */}
                                            <div className="w-full xl:w-80 space-y-8">
                                                <div className="bg-[#081a0b] border border-white/5 shadow-2xl rounded-[32px] overflow-hidden group/preview">
                                                    <div className="bg-white/5 px-8 py-5 border-b border-white/5">
                                                        <h5 className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em]">Live Trace</h5>
                                                    </div>
                                                    <div className="p-8">
                                                        <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-black/40 flex items-center justify-center mb-6 relative group-hover/preview:scale-[1.02] transition-transform duration-700">
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                                                            <img src={previewUrl || (selectedBatch?.documentUrl ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedBatch.documentUrl}` : '')} alt="Source" className="w-full h-full object-cover opacity-60" />
                                                            <div className="absolute bottom-6 left-6 z-20">
                                                                <div className="px-3 py-1 bg-emerald-500 text-[#020804] text-[9px] font-black uppercase rounded-lg">Verified Origin</div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Protocol</span>
                                                                <span className="text-[10px] text-emerald-400 font-black flex items-center gap-2"><ShieldCheck size={12} /> SECURE</span>
                                                            </div>
                                                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Hash State</span>
                                                                <span className="text-[10px] text-white font-black font-mono">READY</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quality Rating Bonus */}
                                                <div className="bg-[#051107] rounded-[32px] p-8 border border-white/5 flex flex-col items-center text-center shadow-2xl">
                                                    <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 shadow-emerald-500/5 text-emerald-500 animate-bounce" style={{ animationDuration: '3s' }}>
                                                        <Star size={32} fill="currentColor" />
                                                    </div>
                                                    <h5 className="font-black text-white text-[10px] uppercase tracking-[0.4em] mb-6">Quality Tier</h5>
                                                    <div className="flex gap-2 w-full mb-6">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <div key={star} className={`flex-1 h-2 rounded-full transition-all duration-1000 ${star <= (ocrData.prediction?.probability * 5 || 4) ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/5'}`}></div>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-tighter italic">Grade: High-Spectrum Premium Listing Detected.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-6 pt-12 border-t border-white/5 mt-auto">
                                            <button
                                                onClick={handleReject}
                                                className="px-10 py-5 border border-white/10 rounded-2xl text-gray-500 font-black text-[10px] tracking-[0.4em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all uppercase"
                                            >
                                                Reject Payload
                                            </button>
                                            <button
                                                onClick={handleApproveAndStore}
                                                disabled={isApproving}
                                                className="flex-1 flex justify-center items-center gap-4 py-6 bg-white text-[#020804] rounded-2xl font-black text-xs tracking-[0.4em] shadow-[0_30px_70px_-15px_rgba(255,255,255,0.2)] hover:bg-emerald-400 transition-all disabled:opacity-50 uppercase hover:translate-y-[-4px]"
                                            >
                                                {isApproving ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={22} /> Commit to Blockchain</>}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 4: Success / Blockchain View */}
                                {blockchainHash && (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-24 flex-1 flex flex-col items-center justify-center relative z-10">
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/20 blur-[150px] rounded-full"></div>
                                        </div>

                                        <motion.div
                                            initial={{ rotate: -180, scale: 0 }}
                                            animate={{ rotate: 0, scale: 1 }}
                                            transition={{ type: "spring", damping: 15, stiffness: 100 }}
                                            className="w-32 h-32 bg-emerald-500 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-[0_0_80px_rgba(16,185,129,0.4)]"
                                        >
                                            <ShieldCheck size={64} className="text-[#020804]" strokeWidth={2.5} />
                                        </motion.div>

                                        <h3 className="text-6xl font-black text-white mb-4 tracking-tighter">Minting <span className="text-emerald-500">Confirmed.</span></h3>
                                        <p className="text-gray-400 mb-16 max-w-sm mx-auto font-medium text-lg">Permanent record inscribed on the **Polygon Mainnet** substrate.</p>

                                        <div className="bg-[#030a04] border border-emerald-500/20 rounded-[32px] p-10 font-mono text-xs break-all text-left w-full max-w-2xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative group/hash">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Database size={60} className="text-emerald-500" />
                                            </div>
                                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                                <span className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[10px]">Immutable Quality ID</span>
                                                <div className="flex gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500/40"></div>
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500/20"></div>
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500/10"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <span className="text-gray-600 block mb-2 font-black uppercase tracking-widest text-[9px]">Transaction Hash</span>
                                                    <span className="text-emerald-400 font-bold leading-relaxed selection:bg-emerald-500 selection:text-black">{blockchainHash}</span>
                                                </div>
                                                <div className="flex gap-8 pt-4">
                                                    <div>
                                                        <span className="text-gray-600 block mb-1 font-black uppercase tracking-widest text-[8px]">Network</span>
                                                        <span className="text-white font-bold uppercase text-[10px]">Polygon POS</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 block mb-1 font-black uppercase tracking-widest text-[8px]">Status</span>
                                                        <span className="text-white font-bold uppercase text-[10px]">Finalized</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-20">
                                            <button
                                                onClick={() => { setSelectedBatch(null); setOcrData(null); setBlockchainHash(null); setSelectedFile(null); setPreviewUrl(null); }}
                                                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-[10px] tracking-[0.5em] transition-all uppercase flex items-center gap-3 border border-white/5"
                                            >
                                                Next Payload Substrate <ArrowRight size={16} className="text-emerald-500" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}


                            </motion.div>
                        ) : (
                            <motion.div
                                key="terminal-empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-[#040c06] rounded-[48px] border-2 border-dashed border-white/5 p-24 flex flex-col items-center justify-center text-center h-full min-h-[700px] relative overflow-hidden group"
                            >
                                {/* Animated Ambient Background */}
                                <div className="absolute inset-0 bg-emerald-500/[0.01] animate-pulse"></div>

                                <motion.div
                                    animate={{
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-32 h-32 bg-emerald-500/5 rounded-[40px] flex items-center justify-center mb-10 ring-1 ring-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
                                >
                                    <Cpu size={56} className="text-emerald-500/30 animate-pulse" />
                                </motion.div>

                                <h3 className="text-4xl font-black text-white tracking-tighter mb-4">Neural <span className="text-emerald-500 italic font-medium">Consensus</span> Hub.</h3>
                                <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed text-sm tracking-wide">Select a harvested batch from the authentication queue to initialize verification protocols.</p>

                                <div className="mt-12 flex gap-6">
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="w-2 h-2 bg-emerald-500/40 rounded-full"
                                            style={{
                                                animation: `bounce 1.5s infinite ${i * 0.2}s`,
                                                boxShadow: '0 0 10px rgba(16,185,129,0.5)'
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default CertifierDashboard;
