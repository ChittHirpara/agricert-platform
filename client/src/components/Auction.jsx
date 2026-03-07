import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useCrossTabSync } from '../hooks/useCrossTabSync';
import { Gavel, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

// Connect to WebSocket server
const SOCKET_URL = 'http://localhost:5000';

const Auction = ({ productId, currentUserId, currentUserRole }) => {
    const [socket, setSocket] = useState(null);

    // Standard local state
    const [auctionState, setAuctionState] = useState({
        highestBid: 0,
        highestBidder: null,
        status: 'connecting', // connecting, active, ended
        error: null
    });

    // Custom hook to sync auction state horizontally across tabs
    const { emit: syncTabs } = useCrossTabSync(`auction_sync_${productId}`, (data) => {
        if (data.type === 'NEW_BID') {
            setAuctionState((prev) => ({ ...prev, highestBid: data.amount }));
        }
    });

    const [bidAmount, setBidAmount] = useState('');

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        // Join Room
        newSocket.emit('joinRoom', productId);

        // Initial state sync
        newSocket.on('auctionState', (state) => {
            setAuctionState((prev) => ({
                ...prev,
                highestBid: state.highestBid || 0,
                highestBidder: state.highestBidder || null,
                status: state.status || 'active',
                error: null
            }));
        });

        // Real-time bid updates
        newSocket.on('bidUpdate', (data) => {
            setAuctionState((prev) => ({
                ...prev,
                highestBid: data.highestBid,
                highestBidder: data.highestBidder,
                error: null
            }));
            toast(`New Bid: $${data.highestBid}`, { icon: '💰' });

            // Sync sibling tabs immediately natively
            syncTabs({ type: 'NEW_BID', amount: data.highestBid });
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
    }, [productId, setAuctionState]);

    const handlePlaceBid = (e) => {
        e.preventDefault();
        if (!socket || !bidAmount) return;

        const amount = Number(bidAmount);
        if (amount <= auctionState.highestBid) {
            setAuctionState((prev) => ({ ...prev, error: 'Bid must be higher than current highest bid.' }));
            return;
        }

        socket.emit('placeBid', {
            productId,
            amount,
            userId: currentUserId
        });

        setBidAmount('');
    };

    const isWinning = auctionState.highestBidder === currentUserId;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full max-w-lg mx-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Gavel size={64} />
                </div>
                <h2 className="text-2xl font-bold mb-1 relative z-10">Live Auction</h2>
                <p className="text-green-100 opacity-90 relative z-10 font-mono text-sm">Room: {productId.substring(0, 8)}...</p>
            </div>

            <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center mb-6 border border-gray-100">
                    <span className="text-gray-500 text-sm uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp size={16} /> Current Highest Bid
                    </span>
                    <div className="text-4xl font-bold text-gray-900 font-mono">
                        ${auctionState.highestBid.toLocaleString()}
                    </div>
                    {auctionState.highestBid > 0 && (
                        <div className={`mt-3 text-sm flex items-center gap-2 px-3 py-1 rounded-full ${isWinning ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isWinning ? (
                                <><CheckCircle2 size={14} /> You are the highest bidder!</>
                            ) : (
                                <><AlertCircle size={14} /> Higher bid exists</>
                            )}
                        </div>
                    )}
                </div>

                {auctionState.error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {auctionState.error}
                    </div>
                )}

                {currentUserRole === 'distributor' ? (
                    <form onSubmit={handlePlaceBid} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Bid Total ($)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    $
                                </div>
                                <input
                                    type="number"
                                    required
                                    min={auctionState.highestBid + 1}
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-3 bg-white text-lg font-mono border"
                                    placeholder="e.g. 5000"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={auctionState.status !== 'active'}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Place Bid
                        </button>
                    </form>
                ) : (
                    <div className="text-center text-sm text-gray-500 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        Only distributors can place bids on certified batches.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Auction;
