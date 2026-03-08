import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useCrossTabSync } from '../hooks/useCrossTabSync';
import {
    Gavel, TrendingUp, AlertCircle, CheckCircle2, DollarSign,
    LogOut, ShieldCheck, Leaf, ChevronRight, ArrowUp, Hash,
    Users, Activity, Clock, Zap, Trophy
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SAGE = '#84B179';
const ease = [0.16, 1, 0.3, 1];

// ── Bid History Item ──────────────────────────────
const BidItem = ({ bid, isTop, currentUserId, index, total }) => {
    const isMe = bid.bidder === currentUserId;
    return (
        <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.4, ease }}
            className={`relative flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${isTop
                ? 'border-sage-600/30 bg-sage-600/08'
                : 'border-white/[0.04] bg-white/[0.015]'
                }`}
        >
            {isTop && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full" style={{ background: SAGE }} />
            )}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${isTop ? 'text-[#060c05]' : 'bg-white/[0.06] text-gray-500'
                    }`} style={isTop ? { background: SAGE } : {}}>
                    {isTop ? <Trophy size={13} /> : `#${total - index}`}
                </div>
                <div className="min-w-0">
                    <p className={`text-[10px] font-mono font-bold truncate ${isTop ? 'text-sage-400' : 'text-gray-600'}`}>
                        {isMe ? 'You' : `Bidder_${bid.bidder?.slice(-5) || '?????'}`}
                    </p>
                    <p className="text-[9px] text-gray-700">
                        {new Date(bid.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                </div>
            </div>
            <span className={`font-mono font-black text-sm shrink-0 ${isTop ? 'text-sage-300' : 'text-gray-400'}`}>
                ${bid.amount.toLocaleString()}
            </span>
        </motion.div>
    );
};

// ── Status Color Map ──────────────────────────────
const STATUS_MAP = {
    active: { color: 'text-sage-400', bg: 'bg-sage-600/10 border-sage-600/25', dot: 'bg-sage-500', label: 'Live Session' },
    connecting: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25', dot: 'bg-amber-500', label: 'Syncing...' },
    completed: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/25', dot: 'bg-blue-500', label: 'Concluded' },
    error: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/25', dot: 'bg-red-500', label: 'Link Error' },
};

// ── Main Component ────────────────────────────────
const Auction = ({ user }) => {
    const { batchId } = useParams();
    const productId = batchId;
    const currentUserId = user?._id || user?.id;
    const currentUserRole = user?.role;
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [impact, setImpact] = useState(false);
    const [bidAmount, setBidAmount] = useState('');
    const { scrollY } = useScroll();
    const navBg = useTransform(scrollY, [0, 50], ['rgba(6,12,5,0)', 'rgba(6,12,5,0.97)']);

    const [auctionState, setAuctionState] = useState({
        highestBid: 0, startingPrice: 0,
        highestBidder: null, farmerId: null, auctionId: null,
        status: 'connecting', history: [], error: null,
        cropName: null, location: null,
    });

    const triggerImpact = () => {
        setImpact(true);
        setTimeout(() => setImpact(false), 700);
    };

    const { emit: syncTabs } = useCrossTabSync(`auction_sync_${productId}`, (data) => {
        if (data.type === 'NEW_BID') {
            setAuctionState(prev => ({
                ...prev,
                highestBid: data.amount,
                history: [{ bidder: data.bidder, amount: data.amount, time: new Date() }, ...prev.history].slice(0, 10)
            }));
            triggerImpact();
        }
    });

    const handleExit = () => {
        if (socket) { socket.emit('leaveRoom', productId); socket.disconnect(); }
        navigate('/portal');
    };

    const handleConclude = () => {
        if (!socket || !auctionState.auctionId) return;
        if (window.confirm('FINAL WARNING: Conclude this auction? This is irreversible on the ledger.')) {
            socket.emit('auctionEnd', { auctionId: auctionState.auctionId, batchId: productId });
            toast.success('Finalizing on blockchain...');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling']
        });
        setSocket(newSocket);
        newSocket.emit('joinAuction', productId);

        newSocket.on('connect', () => console.log('WS connected'));
        newSocket.on('connect_error', err => {
            setAuctionState(prev => ({ ...prev, status: 'error', error: err.message }));
            toast.error(`Connection failed: ${err.message}`, { id: 'ws-error' });
        });

        newSocket.on('auctionState', state => {
            setAuctionState(prev => ({
                ...prev,
                highestBid: state.highestBid || 0,
                startingPrice: state.startingPrice || 0,
                highestBidder: state.highestBidder || null,
                farmerId: state.farmerId || null,
                auctionId: state.auctionId || null,
                status: state.status || 'active',
                history: state.history || [],
                cropName: state.cropName || null,
                location: state.location || null,
                error: state.error || null,
            }));
        });

        newSocket.on('bidUpdate', data => {
            setAuctionState(prev => ({
                ...prev,
                highestBid: data.highestBid,
                highestBidder: data.highestBidder,
                history: [{ bidder: data.highestBidder, amount: data.highestBid, time: new Date() }, ...prev.history].slice(0, 10),
                error: null,
            }));
            triggerImpact();
            syncTabs({ type: 'NEW_BID', amount: data.highestBid, bidder: data.highestBidder });
        });

        newSocket.on('auctionEnd', data => {
            setAuctionState(prev => ({ ...prev, status: 'completed', highestBid: data.highestBid, highestBidder: data.winner }));
            toast.success('Auction concluded!');
        });

        newSocket.on('bidError', data => {
            setAuctionState(prev => ({ ...prev, error: data.message }));
            setTimeout(() => setAuctionState(prev => ({ ...prev, error: null })), 5000);
        });

        return () => { newSocket.emit('leaveRoom', productId); newSocket.disconnect(); };
    }, [productId, syncTabs]);

    const handlePlaceBid = e => {
        e.preventDefault();
        if (!socket || !bidAmount) return;
        const amount = Number(bidAmount);
        const minRequired = Math.max(auctionState.highestBid + 1, auctionState.startingPrice);
        if (amount < minRequired) {
            setAuctionState(prev => ({ ...prev, error: `Bid must be at least $${minRequired}.` }));
            return;
        }
        socket.emit('placeBid', { batchId: productId, amount, userId: currentUserId });
        setBidAmount('');
    };

    const isWinning = auctionState.highestBidder === currentUserId;
    const statusMeta = STATUS_MAP[auctionState.status] || STATUS_MAP.connecting;
    const currentBid = auctionState.highestBid || auctionState.startingPrice;

    return (
        <div className="min-h-screen bg-[#060c05] text-white font-sans overflow-hidden">

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'radial-gradient(rgba(132,177,121,0.12) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }} />
                {/* Impact flash */}
                <AnimatePresence>
                    {impact && (
                        <motion.div
                            key="flash"
                            initial={{ opacity: 0 }} animate={{ opacity: 0.06 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: SAGE }}
                        />
                    )}
                </AnimatePresence>
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(132,177,121,0.12) 0%, transparent 70%)' }}
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
                    className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(162,203,139,0.08) 0%, transparent 70%)' }}
                />
            </div>

            {/* Nav */}
            <motion.header style={{ background: navBg }}
                className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/[0.04]">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sage-600/15 border border-sage-600/25 flex items-center justify-center">
                                <Leaf size={15} className="text-sage-500" />
                            </div>
                            <span className="font-black">Agri<span className="text-sage-500">Cert</span></span>
                        </div>
                        <ChevronRight size={14} className="text-gray-600" />
                        <div className="flex items-center gap-2">
                            <Gavel size={13} className="text-sage-500" />
                            <span className="text-sm text-gray-400 font-medium">
                                {auctionState.cropName || `Auction #${productId.slice(-6)}`}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Live status */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${statusMeta.bg} ${statusMeta.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusMeta.dot}`} />
                            {statusMeta.label}
                        </div>
                        <button onClick={handleExit}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-bold uppercase tracking-widest">
                            <LogOut size={13} /> Exit
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Content */}
            <div className="relative z-10 pt-20 min-h-screen flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* ── Left: Main Console ── */}
                    <div className="lg:col-span-8 flex flex-col gap-4">

                        {/* Price Display */}
                        <div className={`relative overflow-hidden rounded-2xl border ${isWinning && auctionState.status === 'active'
                            ? 'border-sage-600/30 bg-[#082009]/80'
                            : 'border-white/[0.06] bg-[#080f07]/80'
                            } p-8 flex flex-col items-center justify-center min-h-[320px] text-center transition-all duration-700`}>

                            {/* Glow on winning */}
                            {isWinning && auctionState.status === 'active' && (
                                <div className="absolute inset-0 pointer-events-none"
                                    style={{ background: 'radial-gradient(circle at center, rgba(132,177,121,0.06) 0%, transparent 70%)' }} />
                            )}

                            <AnimatePresence mode="wait">
                                {auctionState.status === 'error' && (
                                    <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center gap-4">
                                        <AlertCircle size={52} className="text-red-500/60" />
                                        <h2 className="text-2xl font-black text-white">Connection Error</h2>
                                        <p className="text-sm text-red-400/60 font-mono">{auctionState.error}</p>
                                    </motion.div>
                                )}

                                {auctionState.status === 'completed' && (
                                    <motion.div key="completed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center gap-5">
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', damping: 14 }}
                                            className="w-20 h-20 rounded-2xl flex items-center justify-center"
                                            style={{ background: `linear-gradient(135deg, ${SAGE}, #A2CB8B)`, boxShadow: `0 0 50px ${SAGE}40` }}
                                        >
                                            <Trophy size={36} className="text-[#060c05]" />
                                        </motion.div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white mb-1">Auction Concluded</h2>
                                            <p className="text-sage-400 font-mono text-sm">Final: ${auctionState.highestBid.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-sage-600/10 border border-sage-600/20">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
                                                style={{ background: SAGE, color: '#060c05' }}>
                                                W
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] text-gray-600 uppercase tracking-wider">Winner</p>
                                                <p className="text-sm font-bold text-white">
                                                    {auctionState.highestBidder === currentUserId ? '🎉 You!' : `Bidder_${auctionState.highestBidder?.slice(-5)}`}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {(auctionState.status === 'connecting' || auctionState.status === 'active') && (
                                    <motion.div key={currentBid} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                                        className="flex flex-col items-center gap-3">
                                        <span className="text-[10px] font-mono font-bold text-sage-600 uppercase tracking-widest px-3 py-1 bg-sage-600/08 rounded-full border border-sage-600/15">
                                            {auctionState.highestBid > 0 ? 'Current High Bid' : 'Starting Reserve'}
                                        </span>
                                        <div className="flex items-start gap-2">
                                            <span className="text-3xl font-black mt-4" style={{ color: `${SAGE}80` }}>$</span>
                                            <h2 className={`text-7xl sm:text-8xl font-black tracking-tight leading-none ${isWinning ? 'text-sage-300' : 'text-white'
                                                }`} style={isWinning ? { textShadow: `0 0 40px ${SAGE}50` } : {}}>
                                                {currentBid.toLocaleString()}
                                            </h2>
                                        </div>
                                        {auctionState.status === 'connecting' && (
                                            <p className="text-xs text-gray-700 font-mono animate-pulse">Syncing live data...</p>
                                        )}
                                        {auctionState.highestBid > 0 && auctionState.status === 'active' && (
                                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold ${isWinning
                                                    ? 'bg-sage-600/15 border-sage-600/30 text-sage-400'
                                                    : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                                                    }`}>
                                                {isWinning
                                                    ? <><CheckCircle2 size={13} /> You're winning</>
                                                    : <><TrendingUp size={13} /> Bidding active</>
                                                }
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Bid Input */}
                        <div className="rounded-2xl border border-white/[0.06] bg-[#080f07]/80 p-5">
                            {auctionState.status !== 'active' ? (
                                <p className="text-center text-gray-700 font-mono text-xs uppercase tracking-widest py-2">
                                    {auctionState.status === 'completed' ? 'Auction concluded' : 'Waiting for auction to go live...'}
                                </p>
                            ) : currentUserRole === 'distributor' ? (
                                <form onSubmit={handlePlaceBid} className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-500 font-bold text-lg">$</span>
                                        <input
                                            type="number" required
                                            min={Math.max(auctionState.highestBid + 1, auctionState.startingPrice)}
                                            value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                                            placeholder={`Min $${Math.max(auctionState.highestBid + 1, auctionState.startingPrice)}`}
                                            className="w-full bg-black/30 border border-white/[0.07] group-hover:border-sage-600/30 focus:border-sage-600/50 focus:bg-black/50 rounded-xl py-4 pl-10 pr-4 text-xl font-black text-white placeholder-gray-700 outline-none transition-all"
                                        />
                                    </div>
                                    <motion.button type="submit"
                                        whileHover={{ scale: 1.03, boxShadow: `0 0 28px ${SAGE}50` }}
                                        whileTap={{ scale: 0.97 }}
                                        className="px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest text-[#060c05] flex items-center gap-2 shrink-0"
                                        style={{ background: `linear-gradient(135deg, ${SAGE}, #A2CB8B)` }}
                                    >
                                        <Gavel size={17} /> Place Bid
                                    </motion.button>
                                </form>
                            ) : (
                                <div className="flex items-center gap-3 text-gray-600 text-sm italic py-1">
                                    <AlertCircle size={16} className="text-amber-600/50 shrink-0" />
                                    Monitor mode — only certified distributors may bid on this batch.
                                </div>
                            )}

                            <AnimatePresence>
                                {auctionState.error && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 flex items-center gap-2 text-red-400 text-xs font-bold border border-red-500/15 bg-red-500/05 rounded-xl px-4 py-2.5">
                                        <AlertCircle size={13} /> {auctionState.error}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Farmer conclude controls */}
                        {auctionState.farmerId === currentUserId && auctionState.status === 'active' && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-sage-600/20 bg-sage-600/05">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-sage-600/15 border border-sage-600/25 flex items-center justify-center">
                                        <ShieldCheck size={18} className="text-sage-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-wider">Batch Owner Controls</p>
                                        <p className="text-[10px] text-sage-600 font-mono">Conclude auction & finalize on blockchain</p>
                                    </div>
                                </div>
                                <button onClick={handleConclude}
                                    className="px-5 py-2.5 rounded-xl border border-red-500/20 bg-red-500/05 hover:bg-red-500/10 hover:border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                                    Conclude Session <LogOut size={13} />
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* ── Right: Sidebar ── */}
                    <div className="lg:col-span-4 flex flex-col gap-4">

                        {/* Batch Info */}
                        <div className="rounded-2xl border border-white/[0.06] bg-[#080f07]/80 p-5">
                            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/[0.04]">
                                <Activity size={14} className="text-sage-500" />
                                <span className="font-black text-sm">Session Info</span>
                            </div>
                            <div className="space-y-2.5">
                                {[
                                    { label: 'Batch ID', value: productId.slice(-10), mono: true },
                                    { label: 'Starting Reserve', value: `$${auctionState.startingPrice.toLocaleString()}` },
                                    { label: 'Bids Placed', value: auctionState.history.length.toString() },
                                ].map(({ label, value, mono }) => (
                                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-white/[0.03] last:border-0">
                                        <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">{label}</span>
                                        <span className={`text-xs font-bold text-white ${mono ? 'font-mono' : ''}`}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bid Log */}
                        <div className="rounded-2xl border border-white/[0.06] bg-[#080f07]/80 p-5 flex flex-col flex-1 min-h-[300px]">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.04]">
                                <div className="flex items-center gap-2.5">
                                    <TrendingUp size={14} className="text-sage-500" />
                                    <span className="font-black text-sm">Bid Log</span>
                                </div>
                                <span className="text-[9px] font-mono text-gray-700 uppercase tracking-wider">{auctionState.history.length} bids</span>
                            </div>

                            <div className="flex-1 space-y-2 overflow-y-auto max-h-[340px] pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: `${SAGE}30 transparent` }}>
                                <AnimatePresence mode="popLayout">
                                    {auctionState.history.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-32 gap-3 text-center">
                                            <TrendingUp size={28} strokeWidth={1} className="text-sage-600/20" />
                                            <p className="text-xs text-gray-700 font-mono italic">Waiting for first bid...</p>
                                        </div>
                                    ) : (
                                        auctionState.history.map((bid, idx) => (
                                            <BidItem key={`${bid.bidder}-${idx}`} bid={bid} isTop={idx === 0}
                                                currentUserId={currentUserId} index={idx} total={auctionState.history.length} />
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* User chip */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                                style={{ background: `linear-gradient(135deg, ${SAGE}, #A2CB8B)`, color: '#060c05' }}>
                                {(user?.name || user?.role || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{user?.name || 'Anonymous'}</p>
                                <p className="text-[10px] font-mono text-sage-600 uppercase tracking-widest">{user?.role}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auction;
