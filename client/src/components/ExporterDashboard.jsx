import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Package, MapPin, UploadCloud, Loader2, ShieldCheck, Satellite, 
  Globe, Trash2, XCircle, Bell, Check, X, Truck, LayoutGrid, ClipboardList, Box, FileText 
} from 'lucide-react';

import DigitalPassport from './DigitalPassport';
import LiveTracker from './LiveTracker';
import GlobalNetwork from './GlobalNetwork';

const ExporterDashboard = ({ user }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory'); 
  const [showForm, setShowForm] = useState(false);

  // Modal States
  const [viewCertificate, setViewCertificate] = useState(null);
  const [trackBatch, setTrackBatch] = useState(null);
  const [showGlobalMap, setShowGlobalMap] = useState(false);

  const [formData, setFormData] = useState({ productType: '', quantity: '', location: '', destination: '' });
  const [files, setFiles] = useState(null); // Stores the file list object

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`https://agriqcert-1.onrender.com/api/batches/${user.id}`);
      setBatches(res.data);
    } catch (err) { toast.error("Failed to load data"); }
  };

  // --- FILTERS ---
  const pendingOrders = batches.filter(b => b.orderStatus === 'Pending');
  const shippedOrders = batches.filter(b => b.orderStatus === 'Shipped');
  const inventory = batches.filter(b => b.orderStatus === 'None' || b.orderStatus === 'Declined');

  // --- ACTIONS ---
  const handleShipOrder = async (id) => {
    await axios.put(`https://agriqcert-1.onrender.com/api/batches/ship/${id}`);
    toast.success("Shipment Approved!");
    fetchBatches();
  };

  const handleDeclineOrder = async (id) => {
    if(!window.confirm("Decline this order?")) return;
    await axios.put(`https://agriqcert-1.onrender.com/api/batches/decline/${id}`);
    toast.error("Order Declined");
    fetchBatches();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this batch?")) return;
    await axios.delete(`https://agriqcert-1.onrender.com/api/batches/${id}`);
    setBatches(batches.filter(batch => batch._id !== id));
    toast.success("Batch Deleted");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('exporterId', user.id);
      data.append('productType', formData.productType);
      data.append('quantity', formData.quantity);
      data.append('location', formData.location);
      data.append('destination', formData.destination);
      if (files) { for (let i = 0; i < files.length; i++) { data.append('attachments', files[i]); } }
      await axios.post('https://agriqcert-1.onrender.com', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Batch Created!');
      setFormData({ productType: '', quantity: '', location: '', destination: '' });
      setFiles(null);
      setShowForm(false);
      fetchBatches(); 
    } catch (err) { toast.error('Failed to submit'); } finally { setLoading(false); }
  };

  // --- UI COMPONENTS ---
  const TabButton = ({ id, icon: Icon, label, count, color }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
        activeTab === id 
          ? 'bg-gray-900 text-white shadow-lg scale-105' 
          : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <Icon size={18} className={activeTab === id ? color : 'text-gray-400'} />
      {label}
      {count > 0 && (
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
          activeTab === id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Exporter Command Center</h1>
          <p className="text-gray-500 mt-1">Manage inventory, approve orders, and track global shipments.</p>
        </div>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowGlobalMap(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-lg font-semibold hover:bg-blue-700 transition-all">
            <Globe size={20} /> 3D Network
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg font-semibold hover:bg-green-700 transition-all">
            {showForm ? 'Close' : <><Plus size={20} /> New Batch</>}
          </motion.button>
        </div>
      </div>

      {/* NEW BATCH FORM (Collapsible) */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-10">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Package className="text-green-500" /> Create New Batch</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <input required name="productType" value={formData.productType} onChange={(e) => setFormData({...formData, productType: e.target.value})} placeholder="Product Name (e.g. Basmati Rice)" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                 <input required name="quantity" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} placeholder="Quantity (e.g. 5000 Tons)" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                 <input required name="location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Origin Location" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                 <input required name="destination" value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} placeholder="Destination Country" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                 
                 {/* FILE UPLOAD SECTION */}
                 <div className="md:col-span-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors relative group">
                        <input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <UploadCloud className="mx-auto text-gray-400 mb-2 group-hover:text-green-500 transition-colors" size={32} />
                        <p className="text-sm text-gray-500">Click or drag to upload lab reports & images</p>
                    </div>

                    {/* --- NEW: FILE LIST DISPLAY --- */}
                    {files && files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {Array.from(files).map((file, index) => (
                          <div key={index} className="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-100 text-green-800 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            <FileText size={16} className="text-green-600" />
                            <span className="flex-1 truncate">{file.name}</span>
                            <Check size={16} className="text-green-600" />
                          </div>
                        ))}
                      </div>
                    )}
                 </div>

                 <button disabled={loading} className="md:col-span-2 w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Register Batch to Blockchain'}
                 </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TABS NAVIGATION --- */}
      <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-200 pb-4">
        <TabButton id="inventory" icon={LayoutGrid} label="Inventory" count={inventory.length} color="text-blue-400" />
        <TabButton id="orders" icon={Bell} label="Order Requests" count={pendingOrders.length} color="text-yellow-400" />
        <TabButton id="shipped" icon={Truck} label="Shipped History" count={shippedOrders.length} color="text-green-400" />
      </div>

      {/* --- TAB CONTENT: INVENTORY --- */}
      {activeTab === 'inventory' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map(batch => (
            <div key={batch._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group relative hover:shadow-md transition-all">
              <button onClick={() => handleDelete(batch._id)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
              <div className="flex justify-between items-start mb-4 pr-8">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package size={24} /></div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  batch.status === 'Submitted' ? 'bg-yellow-100 text-yellow-700' :
                  batch.status === 'Certified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>{batch.status}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{batch.productType}</h3>
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-1"><MapPin size={14}/> {batch.location}</p>
              
              <div className="pt-4 border-t border-gray-100 space-y-2">
                {batch.status === 'Certified' ? (
                  <>
                    <button onClick={() => setTrackBatch(batch)} className="w-full py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50"><Satellite size={16} className="text-blue-500" /> Track Satellite</button>
                    <button onClick={() => setViewCertificate(batch)} className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-black"><ShieldCheck size={16} /> Digital Passport</button>
                  </>
                ) : batch.status === 'Rejected' ? (
                  <div className="w-full py-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2"><XCircle size={14} /> Inspection Failed</div>
                ) : (
                  <div className="w-full py-3 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-bold text-center">Awaiting Quality Check...</div>
                )}
              </div>
            </div>
          ))}
          {inventory.length === 0 && <EmptyState message="No active inventory." />}
        </motion.div>
      )}

      {/* --- TAB CONTENT: ORDER REQUESTS --- */}
      {activeTab === 'orders' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {pendingOrders.map(batch => (
            <div key={batch._id} className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-yellow-50 text-yellow-600 rounded-2xl"><Bell size={24} className="animate-pulse" /></div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-gray-800">{batch.productType}</h3>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded uppercase">New Request</span>
                  </div>
                  <p className="text-gray-500 text-sm">Buyer requested <strong>{batch.quantity}</strong> to be shipped to <strong>{batch.destination}</strong>.</p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">ID: {batch._id}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleShipOrder(batch._id)} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                  <Check size={20} /> Approve & Ship
                </button>
                <button onClick={() => handleDeclineOrder(batch._id)} className="px-6 py-3 bg-white text-red-500 border border-red-200 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center gap-2">
                  <X size={20} /> Decline
                </button>
              </div>
            </div>
          ))}
          {pendingOrders.length === 0 && <EmptyState message="No incoming orders yet." icon={ClipboardList} />}
        </motion.div>
      )}

      {/* --- TAB CONTENT: SHIPPED HISTORY --- */}
      {activeTab === 'shipped' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {shippedOrders.map(batch => (
            <div key={batch._id} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-xl"><Truck size={20} /></div>
                <div>
                  <h4 className="font-bold text-gray-800">{batch.productType}</h4>
                  <p className="text-sm text-gray-500">Shipped to {batch.destination}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-gray-400">{new Date(batch.createdAt).toLocaleDateString()}</span>
                <button onClick={() => setTrackBatch(batch)} className="text-blue-600 hover:underline text-sm font-bold">View Tracking</button>
              </div>
            </div>
          ))}
          {shippedOrders.length === 0 && <EmptyState message="No shipment history." icon={Box} />}
        </motion.div>
      )}

      {/* --- MODALS --- */}
      <AnimatePresence>{viewCertificate && <DigitalPassport batch={viewCertificate} inspection={{ moisture: '12%', pesticide: 'Safe', isoCode: 'ISO-22000' }} onClose={() => setViewCertificate(null)} />}</AnimatePresence>
      <AnimatePresence>{trackBatch && <LiveTracker batch={trackBatch} onClose={() => setTrackBatch(null)} />}</AnimatePresence>
      <AnimatePresence>{showGlobalMap && <GlobalNetwork batches={batches} onClose={() => setShowGlobalMap(false)} />}</AnimatePresence>

    </div>
  );
};

// Small helper for empty states
const EmptyState = ({ message, icon: Icon = Package }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
    <Icon size={48} className="mb-4 opacity-20" />
    <p className="font-medium">{message}</p>
  </div>
);

export default ExporterDashboard;