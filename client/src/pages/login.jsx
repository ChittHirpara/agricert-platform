import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
// 👇 ADDED 'Loader2' TO THIS LIST
import { Tractor, Microscope, Ship, ArrowLeft, User, Mail, Lock, Facebook, Chrome, Loader2, Wheat, Search, Package, UserSearch } from 'lucide-react';

const Login = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(false); // Default to Sign Up
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('farmer');
  const navigate = useNavigate();

  // --- COLORS BASED ON ROLE ---
  const theme = {
    farmer: { bg: "from-[#4ade80] to-[#059669]", shadow: "shadow-green-500/40", shape: "bg-green-400", desc: "Register to certify and sell agricultural products." },
    certifier: { bg: "from-[#60a5fa] to-[#2563eb]", shadow: "shadow-blue-500/40", shape: "bg-blue-400", desc: "Register to inspect and approve crop certifications." },
    distributor: { bg: "from-[#c084fc] to-[#7c3aed]", shadow: "shadow-purple-500/40", shape: "bg-purple-400", desc: "Register to participate in crop auctions." },
    consumer: { bg: "from-[#f472b6] to-[#db2777]", shadow: "shadow-pink-500/40", shape: "bg-pink-400", desc: "Register to verify product authenticity." }
  }[selectedRole];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { username: formData.username, password: formData.password }
      : { ...formData, role: selectedRole };

    try {
      const res = await axios.post(`https://agriqcert-1.onrender.com${endpoint}`, payload);
      const user = res.data.user;

      if (isLogin && user.role !== selectedRole) {
        toast.error(`Wrong Portal! This is a ${user.role} account.`);
        setLoading(false);
        return;
      }

      toast.success(`Welcome, ${user.username}!`);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (err) {
      console.error(err);
      // Handle the 500 error gracefully
      toast.error(err.response?.data?.msg || 'Server Error. Please restart backend.');
    } finally {
      setLoading(false);
    }
  };

  // --- DEMO ACCOUNTS QUICK LOGIN ---
  const loginDemoAccount = async (roleType) => {
    setLoading(true);

    // Map role to seeded demo account username from our script
    const demoMapping = {
      farmer: { username: "DemoFarmer", expectedRole: "exporter" },
      certifier: { username: "DemoCertifier", expectedRole: "qa" },
      distributor: { username: "DemoDistributor", expectedRole: "importer" },
      consumer: { username: "DemoConsumer", expectedRole: "importer" }, // Consumer uses importer rights temporarily
    };

    const targetDemo = demoMapping[roleType];

    try {
      const res = await axios.post(`http://localhost:5000/api/auth/login`, {
        username: targetDemo.username,
        password: "demo123"
      });

      const user = res.data.user;
      toast.success(`Demo Access: Welcome ${user.username}!`);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (err) {
      console.error(err);
      toast.error('Demo Login Failed. Did you run the seed script?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br ${theme.bg} transition-colors duration-1000`}>

      {/* --- FLOATING 3D SHAPES --- */}
      <motion.div
        animate={{ rotate: 360, y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] right-[10%] w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl z-0 transform rotate-12"
      />
      <motion.div
        animate={{ rotate: -360, y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[10%] left-[5%] w-32 h-32 md:w-40 md:h-40 rounded-full border-[15px] border-white/10 backdrop-blur-md z-20"
      />
      <motion.div
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-[40%] left-[15%] w-16 h-16 rounded-full ${theme.shape} blur-xl opacity-60`}
      />

      {/* BACK BUTTON */}
      <Link to="/" className="absolute top-8 left-8 z-50">
        <button className="flex items-center gap-2 text-white font-bold bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 backdrop-blur-md transition-all">
          <ArrowLeft size={18} /> Back
        </button>
      </Link>

      {/* --- MAIN GLASS CARD --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-4xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row m-4"
      >

        {/* LEFT SIDE: INPUTS */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">
              {isLogin ? 'Welcome Back' : 'Sign Up'}
            </h1>
            <p className="text-white/80 font-medium text-sm mb-4">Blockchain-powered agricultural certification and trading platform.</p>
          </div>
          <p className="text-white/60 mb-8 text-sm italic">
            {isLogin ? 'Enter your details to access the decentralized network.' : theme.desc}
          </p>

          {/* Role Selector */}
          <div className="flex gap-2 mb-6 bg-black/10 p-1 rounded-xl">
            {['farmer', 'certifier', 'distributor', 'consumer'].map((role) => {
              // Icon mapping for roles
              const RoleIcon = { farmer: Wheat, certifier: Search, distributor: Package, consumer: UserSearch }[role];

              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 py-2 flex flex-col items-center justify-center gap-1 text-[10px] md:text-[11px] font-bold uppercase rounded-lg transition-all ${selectedRole === role ? 'bg-white text-black shadow-md p-1' : 'text-white/60 hover:text-white p-1'
                    }`}
                >
                  <RoleIcon size={16} />
                  <span>{role}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="bg-white/20 rounded-2xl p-1 flex items-center border border-white/10 focus-within:bg-white/30 transition-colors">
              <div className="p-3 text-white/60"><User size={20} /></div>
              <input
                type="text" name="username" value={formData.username} onChange={handleChange} required
                placeholder="Full Name / ID"
                className="bg-transparent w-full outline-none text-white placeholder-white/50 font-medium h-10"
              />
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <div className="bg-white/20 rounded-2xl p-1 flex items-center border border-white/10 mb-4 focus-within:bg-white/30 transition-colors">
                    <div className="p-3 text-white/60"><Mail size={20} /></div>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleChange} required
                      placeholder="Email Address"
                      className="bg-transparent w-full outline-none text-white placeholder-white/50 font-medium h-10"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white/20 rounded-2xl p-1 flex items-center border border-white/10 focus-within:bg-white/30 transition-colors">
              <div className="p-3 text-white/60"><Lock size={20} /></div>
              <input
                type="password" name="password" value={formData.password} onChange={handleChange} required
                placeholder="Password"
                className="bg-transparent w-full outline-none text-white placeholder-white/50 font-medium h-10"
              />
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <div className="bg-white/20 rounded-2xl p-1 flex items-center border border-white/10 mt-4 focus-within:bg-white/30 transition-colors">
                    <div className="p-3 text-white/60"><Lock size={20} /></div>
                    <input
                      type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                      placeholder="Confirm Password"
                      className="bg-transparent w-full outline-none text-white placeholder-white/50 font-medium h-10"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </form>
        </div>

        {/* RIGHT SIDE: ACTIONS */}
        <div className="w-full md:w-1/2 bg-white/5 backdrop-blur-sm p-8 md:p-12 flex flex-col justify-center border-l border-white/10 relative overflow-hidden">

          {/* BIG BACKGROUND ICON (Visual Only) */}
          <div className="absolute -right-10 -bottom-10 opacity-10 text-white pointer-events-none">
            {selectedRole === 'farmer' && <Wheat size={300} />}
            {selectedRole === 'certifier' && <Search size={300} />}
            {selectedRole === 'distributor' && <Package size={300} />}
            {selectedRole === 'consumer' && <UserSearch size={300} />}
          </div>

          <h2 className="text-2xl font-bold text-white mb-6">{isLogin ? 'Welcome Back' : 'Join the Future'}</h2>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl mb-6 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Log In' : 'Sign Up')}
          </button>

          <div className="mt-6 p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
            <h3 className="text-white font-bold mb-2">Create your AgriCert account</h3>
            <p className="text-white/70 text-sm">Secure crop certification and trading seamlessly via blockchain.</p>
          </div>

          {/* QUICK DEMO ACCESS SECTION */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4 text-center">Quick Demo Access</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => loginDemoAccount('farmer')}
                className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/90 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Wheat size={16} className="text-green-400" /> Login as Farmer
              </button>
              <button
                onClick={() => loginDemoAccount('certifier')}
                className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/90 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Search size={16} className="text-blue-400" /> Login as Certifier
              </button>
              <button
                onClick={() => loginDemoAccount('distributor')}
                className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/90 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Package size={16} className="text-purple-400" /> Login as Distributor
              </button>
              <button
                onClick={() => loginDemoAccount('consumer')}
                className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/90 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <UserSearch size={16} className="text-pink-400" /> Login as Consumer
              </button>
            </div>

            <p className="mt-6 text-center text-white/40 text-[11px]">
              For hackathon judges: Click any role above to instantly bypass the signup flow and view the corresponding dashboard.
            </p>
          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default Login;