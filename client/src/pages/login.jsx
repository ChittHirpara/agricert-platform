import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ArrowLeft, Mail, Lock, User,
  Wheat, Search, Package, UserSearch,
  Loader2, Zap, Globe, Github
} from 'lucide-react';

// Shared smooth curve
const smoothCurve = [0.16, 1, 0.3, 1];

const Login = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('farmer');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isLogin && formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password, role: selectedRole };

    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);
      const user = res.data.user;

      if (isLogin && user.role !== selectedRole) {
        toast.error(`Wrong Portal! This is a ${user.role} account.`);
        setLoading(false);
        return;
      }

      toast.success(`Welcome, ${user.name}!`);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Authentication failed. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  const loginDemoAccount = async (roleType) => {
    setLoading(true);
    const demoMapping = {
      farmer: { email: "farmer@demo.com" },
      certifier: { email: "certifier@demo.com" },
      distributor: { email: "distributor@demo.com" },
      consumer: { email: "consumer@demo.com" },
    };
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/login`, {
        email: demoMapping[roleType].email,
        password: "password123"
      });
      const user = res.data.user;
      toast.success(`Demo Access: Welcome ${user.name}!`);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (err) {
      toast.error('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020502] flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">

      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_70%)]"></div>
        <motion.div
          animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] border border-green-500/10 rounded-full border-dashed opacity-40"
        ></motion.div>
        <motion.div
          animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] border border-green-500/10 rounded-full border-dashed opacity-40"
        ></motion.div>
      </div>

      {/* BACK BUTTON */}
      <Link to="/" className="absolute top-8 left-8 z-[100]">
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          className="flex items-center gap-2 text-white/70 hover:text-green-400 font-mono text-xs uppercase tracking-widest bg-white/5 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-xl transition-all"
        >
          <ArrowLeft size={14} /> Back to Hub
        </motion.button>
      </Link>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-[1000px] min-h-[650px] bg-[#050A06]/80 backdrop-blur-3xl border border-white/5 rounded-[40px] shadow-[0_20px_80px_rgba(0,0,0,0.8)] flex overflow-hidden group">

        {/* SLIDING OVERLAY PANEL */}
        <motion.div
          initial={false}
          animate={{ x: isLogin ? '100%' : '0%' }}
          transition={{ duration: 1, ease: smoothCurve }}
          className="absolute top-0 left-0 w-1/2 h-full z-50 pointer-events-auto hidden lg:flex"
        >
          <div className="w-full h-full bg-gradient-to-br from-green-600 via-emerald-700 to-green-900 p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Abstract internal graphics */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="text-white" size={24} />
                </div>
                <span className="text-xl font-black text-white tracking-tight">AgriCert</span>
              </div>
              <h1 className="text-5xl font-black text-white leading-[1.1] mb-6 tracking-tighter">
                {isLogin ? "Hello,\nFarmer." : "Join the\nNetwork."}
              </h1>
              <p className="text-white/80 font-medium leading-relaxed max-w-xs">
                {isLogin
                  ? "Enter your credentials to access the world's most trusted agricultural ledger."
                  : "Start certifying your journey with AI-powered quality verification and instant global auctions."
                }
              </p>
            </div>

            <div className="relative z-10">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="px-10 py-4 bg-black text-white rounded-full font-bold text-sm tracking-widest hover:scale-105 transition-all shadow-2xl border border-white/10"
              >
                {isLogin ? "CREATE ACCOUNT" : "SIGN IN INSTEAD"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* LEFT COMPONENT (Sign Up Logic) */}
        <div className={`w-full lg:w-1/2 p-8 md:p-12 border-r border-white/5 flex flex-col justify-center transition-opacity duration-700 ${isLogin ? 'lg:opacity-100' : 'lg:opacity-0 pointer-events-none'}`}>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Sign In</h2>
            <p className="text-gray-500 text-sm font-medium">Decentralized Supply Chain Protocol</p>
          </div>

          {/* Role Toggle */}
          <div className="grid grid-cols-4 gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/5">
            {['farmer', 'certifier', 'distributor', 'consumer'].map((role) => {
              const RoleIcon = { farmer: Wheat, certifier: Search, distributor: Package, consumer: UserSearch }[role];
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${selectedRole === role ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'text-gray-500 hover:text-white'}`}
                >
                  <RoleIcon size={16} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{role}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={18} />
              <input
                type="email" name="email" value={formData.email} onChange={handleChange} required
                placeholder="Email Address"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:bg-white/10 transition-all font-medium"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={18} />
              <input
                type="password" name="password" value={formData.password} onChange={handleChange} required
                placeholder="Enter Password"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:bg-white/10 transition-all font-medium"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-4 bg-green-500 text-black rounded-2xl font-black text-sm tracking-widest shadow-[0_10px_30px_rgba(34,197,94,0.2)] hover:scale-[1.02] transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "AUTHENTICATE"}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4 py-4 lg:hidden">
            <div className="flex-1 h-[1px] bg-white/5"></div>
            <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">New here?</span>
            <div className="flex-1 h-[1px] bg-white/5"></div>
          </div>

          <button onClick={() => setIsLogin(false)} className="lg:hidden w-full py-4 rounded-2xl border border-white/10 text-white font-bold text-sm">CREATE ACCOUNT</button>

          {/* Demo Access */}
          <div className="mt-auto pt-8 border-t border-white/5">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 text-center">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => loginDemoAccount('farmer')} className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-white/50 hover:text-white text-xs font-bold">
                <Wheat size={14} className="text-green-500" /> Farmer
              </button>
              <button onClick={() => loginDemoAccount('certifier')} className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-white/50 hover:text-white text-xs font-bold">
                <Search size={14} className="text-blue-500" /> Certifier
              </button>
              <button onClick={() => loginDemoAccount('distributor')} className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-white/50 hover:text-white text-xs font-bold">
                <Package size={14} className="text-purple-500" /> Distributor
              </button>
              <button onClick={() => loginDemoAccount('consumer')} className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-white/50 hover:text-white text-xs font-bold">
                <UserSearch size={14} className="text-pink-500" /> Consumer
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT (Sign Up Logic) */}
        <div className={`w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center transition-opacity duration-700 ${!isLogin ? 'lg:opacity-100' : 'lg:opacity-0 pointer-events-none'}`}>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Create Account</h2>
            <p className="text-gray-500 text-sm font-medium">Join the Decentralized Agriculture Ecosystem</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={18} />
              <input
                type="text" name="name" value={formData.name} onChange={handleChange} required
                placeholder="Your Full Name"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:bg-white/10 transition-all font-medium"
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={18} />
              <input
                type="email" name="email" value={formData.email} onChange={handleChange} required
                placeholder="Email Address"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:bg-white/10 transition-all font-medium"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={18} />
              <input
                type="password" name="password" value={formData.password} onChange={handleChange} required
                placeholder="Secure Password"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:bg-white/10 transition-all font-medium"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={18} />
              <input
                type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                placeholder="Confirm Password"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:bg-white/10 transition-all font-medium"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-4 bg-green-500 text-black rounded-2xl font-black text-sm tracking-widest shadow-[0_10px_30px_rgba(34,197,94,0.2)] hover:scale-[1.02] transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "PROCEED TO REGISTER"}
            </button>
          </form>

          <button onClick={() => setIsLogin(true)} className="lg:hidden w-full py-4 mt-4 rounded-2xl border border-white/10 text-white font-bold text-sm">SIGN IN INSTEAD</button>

          <div className="mt-auto pt-8 border-t border-white/5">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 text-center">Protocol Security</p>
            <div className="flex justify-center gap-6 opacity-40">
              <Zap size={20} className="text-yellow-500" />
              <ShieldCheck size={20} className="text-green-500" />
              <Globe size={20} className="text-blue-400" />
              <Github size={20} className="text-white" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Login;