import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Upload, Play, Package, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

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

    useEffect(() => {
        fetchBatches();
    }, [user]);

    const fetchBatches = async () => {
        try {
            const res = await axios.get(`${API}/api/batches/my`, {
                headers: getAuthHeader()
            });
            setBatches(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('cropName', formData.cropName);
        data.append('quantity', formData.quantity);
        data.append('location', formData.location);
        if (file) data.append('document', file);

        try {
            await axios.post(`${API}/api/batches`, data, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Crop batch submitted for certification!');
            setShowForm(false);
            setFormData({ cropName: '', quantity: '', location: '' });
            setFile(null);
            fetchBatches();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || 'Failed to create batch');
        } finally {
            setLoading(false);
        }
    };

    const handleStartAuction = async (batchId) => {
        try {
            await axios.post(`${API}/api/auction/start`, { batchId, startingPrice: 100 }, {
                headers: getAuthHeader()
            });
            toast.success('Auction activated successfully!');
            fetchBatches();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || 'Could not start auction');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-500">Track your crop batches, request certifications, and launch live auctions.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-colors"
                >
                    {showForm ? 'Cancel' : <><Plus size={20} /> New Crop Batch</>}
                </button>
            </div>

            {/* Create Batch Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 slideUp">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Register New Crop Batch</h2>
                    <form onSubmit={handleCreateBatch} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
                            <input
                                required type="text" placeholder="e.g. Organic Wheat"
                                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.cropName} onChange={e => setFormData({ ...formData, cropName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg/tons)</label>
                            <input
                                required type="text" placeholder="e.g. 5000 kg"
                                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Farm Location</label>
                            <input
                                required type="text" placeholder="e.g. Gujarat, India"
                                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                            <p className="text-sm font-medium text-gray-700">Upload Lab/Quality Receipt</p>
                            <input
                                type="file" required
                                onChange={e => setFile(e.target.files[0])}
                                className="mt-3 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer mx-auto max-w-xs"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit" disabled={loading}
                                className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-bold shadow-md flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Submit for Certification'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* My Batches Grid */}
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="text-gray-500" /> My Crop Portfolio
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {batches.length === 0 ? (
                    <div className="col-span-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                        <p className="text-gray-500 font-medium">No crops registered yet. Create a batch to start the certification flow.</p>
                    </div>
                ) : (
                    batches.map(batch => (
                        <div key={batch._id} className="bg-white border text-left border-gray-200 shadow-sm rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-lg font-bold text-gray-900">{batch.cropName}</h4>

                                    {/* Status Badge */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${batch.status === 'certified' ? 'bg-green-100 text-green-700 border border-green-200' :
                                        batch.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                                            'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                        }`}>
                                        {batch.status}
                                    </span>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <p className="text-sm text-gray-600"><span className="font-semibold">Batch ID:</span> <span className="font-mono">{batch._id}</span></p>
                                    <p className="text-sm text-gray-600"><span className="font-semibold">Quantity:</span> {batch.quantity}</p>
                                    <p className="text-sm text-gray-600"><span className="font-semibold">Location:</span> {batch.location}</p>

                                    {batch.blockchainHash && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 block">
                                            <p className="text-xs font-bold text-gray-500 mb-1">Blockchain Hash</p>
                                            <p className="text-xs font-mono text-gray-800 break-all">{batch.blockchainHash}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="pt-4 border-t border-gray-100">
                                {batch.status === 'certified' && batch.auctionStatus !== 'active' ? (
                                    <button
                                        onClick={() => handleStartAuction(batch._id)}
                                        className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-sm transition-colors"
                                    >
                                        <Play size={16} fill="white" /> List on Auction Market
                                    </button>
                                ) : batch.auctionStatus === 'active' ? (
                                    <div className="w-full text-center py-2.5 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200 flex items-center justify-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Live Auction Active
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center italic py-2.5">
                                        Awaiting Certifier Approval...
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FarmerDashboard;
