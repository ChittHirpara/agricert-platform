import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Package, Gavel, MapPin, Calendar, ExternalLink } from 'lucide-react';

const AuctionMarketplace = ({ user }) => {
    const [activeAuctions, setActiveAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAuctions();

        // Polling for new auctions occasionally
        const interval = setInterval(fetchAuctions, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchAuctions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auction/list');
            setActiveAuctions(res.data);
        } catch (err) {
            console.error('Failed to fetch auctions', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <div className="mb-8 border-b border-gray-200 pb-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4 shadow-sm">
                    <Gavel size={32} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Live Auction Marketplace</h1>
                <p className="mt-2 text-gray-500 max-w-2xl mx-auto">
                    Browse fully certified agricultural products currently open for live bidding on the blockchain.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
            ) : activeAuctions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center flex flex-col items-center justify-center h-64">
                    <Package size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">No Active Auctions</h3>
                    <p className="text-gray-500 mt-2">Check back later when farmers list their certified crops.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeAuctions.map((batch) => (
                        <div key={batch._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col slideUp">
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{batch.productType}</h3>
                                    <p className="text-gray-400 text-xs mt-1">ID: {batch._id.substring(0, 8)}...</p>
                                </div>
                                <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    LIVE
                                </div>
                            </div>

                            <div className="p-5 flex-1 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Package size={14} className="text-gray-500" /></div>
                                    <span><strong>{batch.quantity}</strong> available</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><MapPin size={14} className="text-gray-500" /></div>
                                    <span>{batch.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Calendar size={14} className="text-gray-500" /></div>
                                    <span>Listed {new Date(batch.createdAt).toLocaleDateString()}</span>
                                </div>

                                {batch.blockchainHash && (
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs font-mono text-gray-500 break-all mt-4">
                                        <strong className="text-gray-700 block mb-1 uppercase tracking-wider text-[10px]">Blockchain TX:</strong>
                                        {batch.blockchainHash.substring(0, 24)}...
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                                <button
                                    onClick={() => navigate(`/auction/${batch._id}`)}
                                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
                                >
                                    Join Auction Room <ExternalLink size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AuctionMarketplace;
