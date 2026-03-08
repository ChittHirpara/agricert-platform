import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useCrossTabSync } from '../hooks/useCrossTabSync';
import { Gavel, TrendingUp, AlertCircle, CheckCircle2, DollarSign, LogOut, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Connect to WebSocket server
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Auction = ({ user }) => {
    const { batchId } = useParams();
    const productId = batchId;
    const currentUserId = user?._id || user?.id;
    const currentUserRole = user?.role;
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);

    // Standard local state
    const [auctionState, setAuctionState] = useState({
        highestBid: 0,
        startingPrice: 0,
        highestBidder: null,
        farmerId: null,
        auctionId: null,
        status: 'connecting', // connecting, active, ended, error
        history: [], // [{ bidder, amount, time }]
        error: null
    });

    // Impact effect states for "Cinematic Energy"
    const [impact, setImpact] = useState(false);
    const [bidAmount, setBidAmount] = useState('');

    const triggerImpact = () => {
        setImpact(true);
        setTimeout(() => setImpact(false), 800);
    };

    // Custom hook to sync auction state horizontally across tabs
    const { emit: syncTabs } = useCrossTabSync(`auction_sync_${productId}`, (data) => {
        if (data.type === 'NEW_BID') {
            setAuctionState((prev) => ({
                ...prev,
                highestBid: data.amount,
                history: [{ bidder: data.bidder, amount: data.amount, time: new Date() }, ...prev.history].slice(0, 10)
            }));
            triggerImpact();
        }
    });

    const handleExit = () => {
        if (socket) {
            socket.emit('leaveRoom', productId);
            socket.disconnect();
        }
        navigate('/portal');
    };

    const handleConclude = () => {
        if (!socket || !auctionState.auctionId) return;
        if (window.confirm("FINAL WARNING: Conclude this auction and finalize the highest bid? This action is irreversible on the ledger.")) {
            socket.emit('auctionEnd', {
                auctionId: auctionState.auctionId,
                batchId: productId
            });
            toast.success("Finalizing Neural Consensus...");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling']
        });
        setSocket(newSocket);

        // Join Auction Room
        newSocket.emit('joinAuction', productId);

        // Connection Events
        newSocket.on('connect', () => {
            console.log('Connected to Auction Neural Link');
        });

        newSocket.on('connect_error', (err) => {
            console.error('Connection error:', err.message);
            setAuctionState(prev => ({ ...prev, status: 'error', error: `Neural Link Failure: ${err.message}` }));
            toast.error(`Neural Link Failure: ${err.message}`, {
                id: 'socket-error',
                style: { background: '#7f1d1d', color: '#fff' }
            });
        });

        // Initial state sync
        newSocket.on('auctionState', (state) => {
            setAuctionState((prev) => ({
                ...prev,
                highestBid: state.highestBid || 0,
                startingPrice: state.startingPrice || 0,
                highestBidder: state.highestBidder || null,
                farmerId: state.farmerId || null,
                auctionId: state.auctionId || null,
                status: state.status || 'active',
                history: state.history || [],
                error: state.error || null
            }));
        });

        // Real-time bid updates
        newSocket.on('bidUpdate', (data) => {
            setAuctionState((prev) => ({
                ...prev,
                highestBid: data.highestBid,
                highestBidder: data.highestBidder,
                history: [{ bidder: data.highestBidder, amount: data.highestBid, time: new Date() }, ...prev.history].slice(0, 10),
                error: null
            }));

            triggerImpact();

            toast(`New High Bid: $${data.highestBid.toLocaleString()}`, {
                icon: '🔥',
                style: {
                    borderRadius: '12px',
                    background: '#064e3b',
                    color: '#fff',
                    border: '1px solid rgba(16,185,129,0.3)',
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                }
            });

            // Sync sibling tabs immediately
            syncTabs({ type: 'NEW_BID', amount: data.highestBid, bidder: data.highestBidder });
        });

        // Auction End relay
        newSocket.on('auctionEnd', (data) => {
            setAuctionState(prev => ({
                ...prev,
                status: 'completed',
                highestBid: data.highestBid,
                highestBidder: data.winner
            }));
            toast.success("Auction Concluded Successfully");
        });

        // Bid Error
        newSocket.on('bidError', (data) => {
            setAuctionState((prev) => ({ ...prev, error: data.message }));
            setTimeout(() => setAuctionState((prev) => ({ ...prev, error: null })), 5000);
        });

        return () => {
            newSocket.emit('leaveRoom', productId);
            newSocket.disconnect();
        };
    }, [productId, syncTabs]);

    const handlePlaceBid = (e) => {
        e.preventDefault();
        if (!socket || !bidAmount) return;

        const amount = Number(bidAmount);
        const minRequired = Math.max(auctionState.highestBid + 1, auctionState.startingPrice);

        if (amount < minRequired) {
            setAuctionState((prev) => ({ ...prev, error: `Bid must be at least $${minRequired}.` }));
            return;
        }

        socket.emit('placeBid', {
            batchId: productId,
            amount,
            userId: currentUserId
        });

        setBidAmount('');
    };

    const isWinning = auctionState.highestBidder === currentUserId;

    return (
        <div className="min-h-screen bg-[#030603] text-white selection:bg-emerald-500/30 font-sans overflow-hidden flex items-center justify-center p-4 relative">

            {/* Ambient Background Visuals */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -40, 0],
                        y: [0, 60, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-green-900/10 rounded-full blur-[100px]"
                />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: impact ? [1, 1.02, 1] : 1,
                    rotate: impact ? [0, -0.2, 0.2, 0] : 0
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
                {/* Main Auction Console (Col 8) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Status Header */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 flex items-center justify-between shadow-2xl">
                        <div className="flex items-center gap-4">
                            <motion.div
                                animate={auctionState.status === 'connecting' ? { opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"
                            >
                                <Gavel size={24} />
                            </motion.div>
                            <div>
                                <h1 className="text-lg font-black tracking-tight uppercase">Live Marketplace</h1>
                                <p className="text-[10px] font-mono text-emerald-500/60 tracking-widest">{productId}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${auctionState.status === 'active' ? 'bg-emerald-400' : auctionState.status === 'error' ? 'bg-red-400' : auctionState.status === 'completed' ? 'bg-blue-400' : 'bg-amber-400'} opacity-75`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${auctionState.status === 'active' ? 'bg-emerald-500' : auctionState.status === 'error' ? 'bg-red-500' : auctionState.status === 'completed' ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${auctionState.status === 'active' ? 'text-emerald-400' : auctionState.status === 'error' ? 'text-red-400' : auctionState.status === 'completed' ? 'text-blue-400' : 'text-amber-400'}`}>
                                    {auctionState.status === 'active' ? 'Live Session' : auctionState.status === 'error' ? 'Link Severed' : auctionState.status === 'completed' ? 'Auction Closed' : 'Syncing Neural Link...'}
                                </span>
                            </div>

                            <button
                                onClick={handleExit}
                                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all group/exit"
                                title="Exit Session"
                            >
                                <LogOut size={16} className="group-hover/exit:-translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* High Stakes Display */}
                    <div className="relative group overflow-hidden bg-[#050A06] border border-white/10 rounded-[48px] p-12 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.5)] min-h-[380px]">

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50" />

                        {/* Impact Flash Overlay */}
                        <AnimatePresence>
                            {impact && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-emerald-400 z-10 pointer-events-none"
                                />
                            )}
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                            {auctionState.status === 'error' ? (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative z-20 flex flex-col items-center text-center px-10"
                                >
                                    <AlertCircle size={64} className="text-red-500/80 mb-6 animate-pulse" />
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 leading-none">Spectrum Interference</h2>
                                    <p className="text-red-400/40 font-mono text-[10px] uppercase tracking-[0.4em]">{auctionState.error || 'Connection Timeout'}</p>
                                </motion.div>
                            ) : auctionState.status === 'completed' ? (
                                <motion.div
                                    key="completed"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative z-20 flex flex-col items-center text-center px-10"
                                >
                                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-2 italic">Neural Consensus Reached</h2>
                                    <p className="text-emerald-500/60 font-mono text-[10px] uppercase tracking-[0.4em] mb-8">Final Valuation: ${auctionState.highestBid.toLocaleString()}</p>

                                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-black font-black">W</div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-mono text-gray-500 uppercase">Winning Delegate</p>
                                            <p className="text-lg font-black text-white">{auctionState.highestBidder === currentUserId ? 'You (Finalized)' : `Protocol_${auctionState.highestBidder?.substring(0, 8)}`}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={auctionState.highestBid || auctionState.startingPrice}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="relative z-20 flex flex-col items-center"
                                >
                                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-emerald-500/60 mb-4 px-3 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10">
                                        {auctionState.highestBid > 0 ? 'Current Valuation' : 'Starting Reserve'}
                                    </span>
                                    <div className="flex items-start gap-3">
                                        <span className="text-4xl lg:text-5xl font-black text-emerald-500/40 mt-6 lg:mt-8">$</span>
                                        <h2 className={`text-8xl lg:text-[10rem] font-black tracking-tighter leading-none transition-all duration-300 ${isWinning ? 'text-white' : 'text-emerald-400'} drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]`}>
                                            {(auctionState.highestBid || auctionState.startingPrice).toLocaleString()}
                                        </h2>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {auctionState.highestBid > 0 && auctionState.status === 'active' && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className={`mt-10 px-6 py-2 rounded-full border flex items-center gap-3 ${isWinning ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/20'}`}
                            >
                                {isWinning ? (
                                    <><CheckCircle2 size={16} className="text-emerald-400" /><span className="text-xs font-black uppercase tracking-widest text-emerald-400">Winning Position</span></>
                                ) : (
                                    <><TrendingUp size={16} className="text-amber-400" /><span className="text-xs font-black uppercase tracking-widest text-amber-400">Bidding Activity High</span></>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Bid Input Console */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8">
                        {auctionState.status !== 'active' ? (
                            <div className="py-2 text-center text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em] italic">
                                Neural Transmission Terminated
                            </div>
                        ) : currentUserRole === 'distributor' ? (
                            <form onSubmit={handlePlaceBid} className="flex flex-col sm:flex-row items-end gap-6 w-full">
                                <div className="flex-1 w-full flex flex-col gap-3">
                                    <label className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Elevate Bid ($)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-emerald-400 font-bold text-xl">$</div>
                                        <input
                                            type="number"
                                            required
                                            min={auctionState.highestBid + 1}
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            className="w-full bg-[#08120B] border border-white/10 group-hover:border-emerald-500/40 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl py-5 pl-12 pr-6 text-2xl font-black text-white placeholder:text-white/5 transition-all duration-500 outline-none"
                                            placeholder={`Target ${Math.max(auctionState.highestBid + 1, auctionState.startingPrice)}`}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto min-w-[220px] h-[72px] bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all duration-500 group"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Strike Gavel <DollarSign size={20} className="group-hover:rotate-12 transition-transform" />
                                    </span>
                                </button>
                            </form>
                        ) : (
                            <div className="flex items-center gap-4 text-gray-400 italic text-sm py-2">
                                <AlertCircle size={20} className="text-amber-500/60" />
                                Monitor Mode: Only verified distributors may place bids on this batch.
                            </div>
                        )}

                        {auctionState.error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mt-4 text-xs font-bold text-red-400 flex items-center gap-2"
                            >
                                <AlertCircle size={14} /> {auctionState.error}
                            </motion.div>
                        )}
                    </div>

                    {/* Owner Controls */}
                    {auctionState.farmerId === currentUserId && auctionState.status === 'active' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 bg-white/5 border border-emerald-500/20 rounded-[32px] flex flex-col sm:flex-row items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest mb-1">Ownership Presence Verified</p>
                                    <p className="text-sm font-black text-white uppercase tracking-tight">Final Consensus Authority</p>
                                </div>
                            </div>
                            <button
                                onClick={handleConclude}
                                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-white hover:text-red-400 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 group"
                            >
                                Conclude Session <LogOut size={16} className="group-hover:rotate-90 transition-transform" />
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar: Activity History (Col 4) */}
                <div className="lg:col-span-4 h-full">
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 h-full flex flex-col gap-8 shadow-2xl relative overflow-hidden">

                        {/* Top Gradient Fade */}
                        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0e1f14] to-transparent z-10 pointer-events-none opacity-20" />

                        <div className="flex flex-col gap-2 relative z-20">
                            <h3 className="text-xl font-black tracking-tight">Bid History</h3>
                            <div className="h-1 w-12 bg-emerald-500 rounded-full" />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar relative z-20">
                            <AnimatePresence mode="popLayout">
                                {auctionState.history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full opacity-30 italic text-sm text-center py-20">
                                        <TrendingUp size={48} className="mb-4 stroke-[1px]" />
                                        Waiting for first bid...
                                    </div>
                                ) : (
                                    auctionState.history.map((bid, idx) => (
                                        <motion.div
                                            key={`${bid.bidder}-${idx}-${bid.amount}`}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-4 rounded-2xl border transition-all duration-500 ${idx === 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-[10px] font-mono font-black uppercase tracking-widest ${idx === 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    {idx === 0 ? 'Newest Activity' : `System Log #${auctionState.history.length - idx}`}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-mono">
                                                    {new Date(bid.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-emerald-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                                                        {bid.bidder?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <span className={`font-bold text-sm ${idx === 0 ? 'text-white' : 'text-gray-400'}`}>
                                                        {bid.bidder === currentUserId ? 'You' : `User_${bid.bidder?.substring(0, 5)}`}
                                                    </span>
                                                </div>
                                                <span className={`font-mono font-black ${idx === 0 ? 'text-emerald-400 text-lg' : 'text-gray-300'}`}>
                                                    ${bid.amount.toLocaleString()}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* User Summary Widget */}
                        <div className="mt-auto pt-6 border-t border-white/10">
                            <div className="bg-[#08120B] rounded-2xl border border-white/5 p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-black">
                                    {user?.role?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">{user?.role}</p>
                                    <p className="text-xs font-bold text-white leading-none truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Custom Styles for Scrollbar */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(16,185,129,0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(16,185,129,0.4);
                }
            `}</style>
        </div>
    );
};

export default Auction;
