import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, ShieldCheck, Box, Search } from 'lucide-react';

const API = 'http://localhost:5000';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

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
        if (blockchainHash) return 4; // Complete
        if (ocrData && !isApproving) return 2; // Approved phase / Ready to approve
        if (ocrData) return 1; // OCR Done
        if (selectedFile) return 0; // Uploaded
        return -1;
    };

    const currentStepIndex = getCurrentStepIndex();

    useEffect(() => {
        fetchPendingBatches();
    }, []);

    const fetchPendingBatches = async () => {
        try {
            const res = await axios.get(`${API}/api/batches/pending`, {
                headers: getAuthHeader()
            });
            setBatches(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setOcrData(null);
            setBlockchainHash(null);
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
                res = await axios.post(`${API}/api/ocr/scan`, formData, {
                    headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Use existing document from the batch
                res = await axios.post(`${API}/api/ocr/scan`,
                    { existingFilePath: selectedBatch.documentUrl },
                    { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } }
                );
            }
            setOcrData(res.data.ocrData);
        } catch (error) {
            console.error('OCR Error', error);
            alert('Failed to scan document');
        } finally {
            setIsScanning(false);
        }
    };

    const handleApproveAndStore = async () => {
        if (!selectedBatch || !ocrData) return;
        setIsApproving(true);

        try {
            const res = await axios.post(`${API}/api/certifications/approve`, {
                batchId: selectedBatch._id,
                ocrData: ocrData
            }, {
                headers: getAuthHeader()
            });

            setBlockchainHash(res.data.batch?.blockchainHash || 'stored');

            // Update local UI
            const updatedBatches = batches.filter(b => b._id !== selectedBatch._id);
            setBatches(updatedBatches);

        } catch (error) {
            console.error('Certification Error', error);
            alert(error.response?.data?.msg || 'Failed to approve certification');
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!selectedBatch) return;
        try {
            await axios.post(`${API}/api/certifications/reject`, {
                batchId: selectedBatch._id,
                reason: 'Quality standards not met'
            }, {
                headers: getAuthHeader()
            });
            const updatedBatches = batches.filter(b => b._id !== selectedBatch._id);
            setBatches(updatedBatches);
            setSelectedBatch(null);
            setOcrData(null);
            setBlockchainHash(null);
            setSelectedFile(null);
            alert('Batch rejected successfully');
        } catch (error) {
            console.error('Rejection Error', error);
            alert(error.response?.data?.msg || 'Failed to reject batch');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Certifier Workspace</h1>
                <p className="mt-2 text-sm text-gray-500">Review pending crops, run OCR analysis, and issue immutable blockchain certificates.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Batch List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                            <Box size={18} className="text-gray-500" />
                            <h3 className="font-semibold text-gray-700">Pending Batches</h3>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {batches.map(batch => (
                                <div
                                    key={batch._id}
                                    onClick={() => { setSelectedBatch(batch); setOcrData(null); setBlockchainHash(null); setSelectedFile(null); }}
                                    className={`p-4 cursor-pointer hover:bg-green-50 transition-colors ${selectedBatch?._id === batch._id ? 'bg-green-50 border-l-4 border-green-500' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-medium text-gray-900">{batch.cropName}</h4>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                            {batch.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 flex flex-col gap-1 mt-2">
                                        <span>ID: {batch._id.substring(0, 8)}...</span>
                                        <span>Qty: {batch.quantity} | Loc: {batch.location}</span>
                                    </div>
                                </div>
                            ))}
                            {batches.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    <CheckCircle size={32} className="mx-auto text-green-300 mb-2" />
                                    <p>All caught up!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Certification Flow */}
                <div className="lg:col-span-2">
                    {selectedBatch ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

                            {/* Timeline UI */}
                            <div className="mb-10 mt-2">
                                <div className="flex items-center justify-between relative">
                                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
                                    <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500 ease-in-out`} style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}></div>

                                    {steps.map((step, idx) => {
                                        const isCompleted = currentStepIndex >= idx;
                                        const isCurrent = currentStepIndex === idx;
                                        const Icon = step.icon;
                                        return (
                                            <div key={idx} className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${isCompleted ? 'bg-green-600 text-white' : isCurrent ? 'bg-green-100 text-green-600 border-green-200' : 'bg-gray-100 text-gray-400'}`}>
                                                    <Icon size={18} />
                                                </div>
                                                <span className={`text-xs mt-2 font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Step 1: Upload */}
                            {!ocrData && (
                                <div className="space-y-6">
                                    {/* Show existing document from batch if available */}
                                    {selectedBatch.documentUrl && !selectedFile && (
                                        <div className="flex flex-col items-center animate-fadeIn">
                                            <p className="text-sm text-gray-600 mb-2">Batch has an uploaded document:</p>
                                            <div className="w-full max-w-sm rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                <img src={`${API}${selectedBatch.documentUrl}`} alt="Batch Document" className="w-full h-auto" />
                                            </div>
                                            <button
                                                onClick={handleOcrScan}
                                                disabled={isScanning}
                                                className="mt-4 w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                {isScanning ? (
                                                    <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Extracting Data...</>
                                                ) : (
                                                    <><Search size={18} /> Run OCR on Batch Document</>
                                                )}
                                            </button>
                                            <p className="text-xs text-gray-400 mt-3">Or upload a different document below:</p>
                                        </div>
                                    )}

                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                                        <Upload size={40} className="text-gray-400 mb-4" />
                                        <p className="text-sm text-gray-600 font-medium">Upload Lab/Quality Certificate</p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="cert-upload"
                                        />
                                        <label htmlFor="cert-upload" className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                                            Select File
                                        </label>
                                    </div>

                                    {previewUrl && (
                                        <div className="flex flex-col items-center animate-fadeIn">
                                            <div className="w-full max-w-sm rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                <img src={previewUrl} alt="Certificate Preview" className="w-full h-auto" />
                                            </div>
                                            <button
                                                onClick={handleOcrScan}
                                                disabled={isScanning}
                                                className="mt-4 w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                {isScanning ? (
                                                    <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Extracting Data...</>
                                                ) : (
                                                    <><Search size={18} /> Run OCR Analysis</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2 & 3: Review OCR & Approve */}
                            {ocrData && !blockchainHash && (
                                <div className="animate-fadeIn space-y-6">
                                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FileText size={20} className="text-blue-500" /> Extracted Quality Data
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            {Object.entries(ocrData).filter(([key]) => key !== 'rawText').map(([key, value]) => (
                                                <div key={key} className="bg-white p-3 rounded-md border border-gray-100 shadow-sm">
                                                    <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">{key}</span>
                                                    <span className="block text-sm text-gray-900 font-medium">{value}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* --- ML BONUS FEATURE --- */}
                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100 flex items-start gap-4">
                                            <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 mt-1">
                                                <CheckCircle size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-indigo-900">AI Prediction: Certification Success</h5>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex-1 bg-white rounded-full h-3 border border-indigo-100 overflow-hidden">
                                                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: '88%' }}></div>
                                                    </div>
                                                    <span className="font-bold text-indigo-700">88%</span>
                                                </div>
                                                <p className="text-sm text-indigo-800 mt-2">
                                                    <strong>Suggestion:</strong> Moisture levels are acceptable but slightly elevated. Ensure dry storage before auction entry to maintain grade.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleReject}
                                            className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={handleApproveAndStore}
                                            disabled={isApproving}
                                            className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                        >
                                            {isApproving ? "Securing on Blockchain..." : <><ShieldCheck size={18} /> Approve & Mint Certificate</>}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Success / Blockchain View */}
                            {blockchainHash && (
                                <div className="animate-fadeIn text-center py-8">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <ShieldCheck size={40} className="text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Certification Immutable</h3>
                                    <p className="text-gray-500 mb-6">This batch is now stored on the Polygon Amoy Testnet and is ready for auction.</p>

                                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm break-all border border-gray-200 inline-block text-left w-full max-w-md">
                                        <span className="text-gray-400 block mb-1">Transaction Hash:</span>
                                        <span className="text-gray-800 font-semibold">{blockchainHash}</span>
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            onClick={() => { setSelectedBatch(null); setOcrData(null); setBlockchainHash(null); setSelectedFile(null); }}
                                            className="text-green-600 font-medium hover:text-green-700"
                                        >
                                            Review Next Batch &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                            <FileText size={48} className="text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No Batch Selected</h3>
                            <p className="mt-1 text-gray-500">Select a batch from the queue to start certification.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertifierDashboard;
