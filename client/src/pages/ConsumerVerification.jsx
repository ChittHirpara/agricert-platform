import React, { useState } from 'react';
import axios from 'axios';
import { Search, MapPin, ShieldCheck, FileText, CheckCircle2, User, FileDigit, Calendar } from 'lucide-react';

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
            const res = await axios.get(`http://localhost:5000/api/verify/${productId}`);
            setResult(res.data.data);
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-16 px-4">
            <div className="max-w-3xl w-full">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 shadow-sm">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Consumer Verification</h1>
                    <p className="text-lg text-gray-600">Enter your product's unique ID to verify its journey from farm to table via the Polygon blockchain.</p>
                </div>

                {/* Search Box */}
                <div className="bg-white p-6 rounded-2xl shadow-xl shadow-green-900/5 mb-8 border border-gray-100">
                    <form onSubmit={handleVerify} className="relative">
                        <input
                            type="text"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            placeholder="Enter Product ID (e.g. 64b2d9f...)"
                            className="w-full pl-12 pr-32 py-4 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none font-mono text-lg"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                        <button
                            type="submit"
                            disabled={loading || !productId.trim()}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                <><div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> verifying...</>
                            ) : (
                                <>Verify</>
                            )}
                        </button>
                    </form>
                    {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                </div>

                {/* Results */}
                {result && (
                    <div className="animate-fadeIn space-y-6">

                        {/* Blockchain Banner */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 p-3 rounded-full">
                                    <FileDigit size={28} className="text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg flex items-center gap-2">Immutable Blockchain Record <CheckCircle2 size={16} className="text-green-400" /></h3>
                                    <p className="text-sm text-gray-300">Stored perfectly on <strong>Polygon Amoy</strong>.</p>
                                </div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 w-full sm:w-auto overflow-hidden">
                                <span className="text-xs text-gray-400 uppercase tracking-widest block mb-1">TX Hash</span>
                                <span className="font-mono text-xs text-green-400 break-all">{result.blockchain.hash}</span>
                            </div>
                        </div>

                        {/* Product & Flow Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Product Info */}
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
                                    <Box className="text-blue-500" /> Product Details
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <span className="block text-xs text-gray-500 uppercase font-semibold">Type</span>
                                        <span className="text-gray-900 text-lg">{result.productDetails.productType || "Unknown"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <div>
                                            <span className="block text-xs text-gray-500 uppercase font-semibold">Quantity</span>
                                            <span className="text-gray-900">{result.productDetails.quantity || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500 uppercase font-semibold text-right">Registered On</span>
                                            <span className="text-gray-900 flex items-center gap-1">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(result.productDetails.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Farmer Info */}
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
                                    <User className="text-green-600" /> Origin Farmer
                                </h4>
                                {result.farmer ? (
                                    <div className="space-y-4">
                                        <div>
                                            <span className="block text-xs text-gray-500 uppercase font-semibold">Farm Name</span>
                                            <span className="text-gray-900 text-lg">{result.farmer.companyName || "Unknown Farm"}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500 uppercase font-semibold">Location</span>
                                            <span className="text-gray-900 flex items-center gap-1">
                                                <MapPin size={16} className="text-red-500" /> {result.productDetails.location || "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-gray-500 italic">Farmer information unavailable.</span>
                                )}
                            </div>

                            {/* Quality & OCR Data */}
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
                                <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
                                    <FileText className="text-purple-500" /> Inspected Quality Assurances
                                </h4>
                                {result.inspectionData ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <span className="block text-xs text-green-800 uppercase font-semibold mb-1">Status</span>
                                            <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={16} /> {result.inspectionData.result || "CERTIFIED"}</span>
                                        </div>
                                        {result.inspectionData.ocrData && Object.entries(result.inspectionData.ocrData).map(([key, value]) => (
                                            <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">{key}</span>
                                                <span className="text-gray-900 font-medium">{value}</span>
                                            </div>
                                        ))}
                                        {!result.inspectionData.ocrData && (
                                            <div className="col-span-3 text-sm text-gray-500 flex items-center h-full pl-4">Detailed OCR data is attached physically to this batch via the Certifier.</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 italic">Pre-certified manually without full OCR data.</div>
                                )}
                            </div>

                            {/* --- NEW HACKATHON FEATURE: SUPPLY CHAIN TIMELINE --- */}
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-2 mt-2">
                                <h4 className="text-gray-900 font-bold mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
                                    <MapPin className="text-orange-500" /> Supply Chain Timeline
                                </h4>
                                <div className="relative">
                                    {/* The connecting line */}
                                    <div className="absolute top-1/2 left-4 right-4 h-1 bg-green-100 transform -translate-y-1/2 z-0 hidden sm:block"></div>
                                    <div className="absolute top-1/2 left-4 h-1 bg-green-500 transform -translate-y-1/2 z-0 hidden sm:block" style={{ width: result.productDetails.auctionStatus === 'active' ? '100%' : '80%' }}></div>

                                    <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-6 sm:gap-0">

                                        <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2">
                                            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md shadow-green-200"><User size={20} /></div>
                                            <div className="text-left sm:text-center">
                                                <span className="block font-bold text-gray-900 text-sm">Crop Created</span>
                                                <span className="text-xs text-gray-500">Farmer</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2">
                                            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md shadow-green-200"><FileText size={20} /></div>
                                            <div className="text-left sm:text-center">
                                                <span className="block font-bold text-gray-900 text-sm">OCR Scanned</span>
                                                <span className="text-xs text-gray-500">Certifier</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2">
                                            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md shadow-green-200"><CheckCircle2 size={20} /></div>
                                            <div className="text-left sm:text-center">
                                                <span className="block font-bold text-gray-900 text-sm">Approved</span>
                                                <span className="text-xs text-gray-500">Quality Assured</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2">
                                            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md shadow-green-200"><ShieldCheck size={20} /></div>
                                            <div className="text-left sm:text-center">
                                                <span className="block font-bold text-gray-900 text-sm">Blockchain</span>
                                                <span className="text-xs text-gray-500">Polygon Recorded</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${result.productDetails.auctionStatus !== 'pending' ? 'bg-green-500 text-white shadow-green-200' : 'bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300'}`}>
                                                <Calendar size={20} />
                                            </div>
                                            <div className="text-left sm:text-center">
                                                <span className={`block font-bold text-sm ${result.productDetails.auctionStatus !== 'pending' ? 'text-gray-900' : 'text-gray-400'}`}>Auction Ready</span>
                                                <span className="text-xs text-gray-500">Marketplace</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsumerVerification;
