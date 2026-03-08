import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Wheat, Search, Package, UserSearch,
  Mail, Lock, User, ArrowRight, ArrowLeft,
  Loader2, Shield, Leaf, Eye, EyeOff,
  Microscope, Globe, LineChart, ShieldCheck,
} from 'lucide-react';

// ── Easing ──────────────────────────────────────────────
const ease = [0.16, 1, 0.3, 1];

// ── Role Config ──────────────────────────────────────────
const ROLES = [
  {
    id: 'farmer',
    label: 'Farmer',
    Icon: Wheat,
    tagline: 'Register & export your certified crops.',
    description: 'Submit batches, get AI-certified, access global auction markets.',
    color: '#84B179',
    gradient: 'from-sage-900/80 via-sage-800/60 to-[#060c05]',
    accentClass: 'text-sage-500',
    bgAccent: 'bg-sage-600/20',
    border: 'border-sage-600/40',
    features: ['Batch Registration', 'OCR Document Upload', 'Live Auction Access', 'Export Certificates'],
  },
  {
    id: 'certifier',
    label: 'Certifier',
    Icon: Microscope,
    tagline: 'Inspect, sign, and certify on-chain.',
    description: 'Run the OCR AI pipeline, approve quality grades, and mint immutable certificates.',
    color: '#A2CB8B',
    gradient: 'from-sage-800/70 via-sage-700/50 to-[#060c05]',
    accentClass: 'text-sage-400',
    bgAccent: 'bg-sage-500/20',
    border: 'border-sage-500/40',
    features: ['AI OCR Inspection', 'Cryptographic Signing', 'Audit Dashboard', 'Agency Branding'],
  },
  {
    id: 'distributor',
    label: 'Distributor',
    Icon: Globe,
    tagline: 'Procure certified lots in real time.',
    description: 'Bid in live WebSocket auctions, manage purchase orders, and track shipments globally.',
    color: '#C7EABB',
    gradient: 'from-sage-700/60 via-sage-600/40 to-[#060c05]',
    accentClass: 'text-sage-300',
    bgAccent: 'bg-sage-400/20',
    border: 'border-sage-400/40',
    features: ['Live Bidding Room', 'Order Management', 'Port Tracking', 'Price Analytics'],
  },
  {
    id: 'consumer',
    label: 'Consumer',
    Icon: LineChart,
    tagline: 'Verify and trace every product.',
    description: 'Scan QR codes on physical products to access the full cryptographic audit trail instantly.',
    color: '#E8F5BD',
    gradient: 'from-sage-600/50 via-sage-500/30 to-[#060c05]',
    accentClass: 'text-sage-200',
    bgAccent: 'bg-sage-300/20',
    border: 'border-sage-300/40',
    features: ['QR Verification', 'Supply Chain View', 'Lab Report Access', 'Shipment History'],
  },
];

// ── Floating Particle ─────────────────────────────────────
const Particle = ({ delay, x, y, size, color }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color }}
    animate={{
      y: [0, -20, 0, 15, 0],
      x: [0, 10, -5, 0],
      opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
      scale: [1, 1.2, 0.9, 1.1, 1],
    }}
    transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

// ── Form Field ────────────────────────────────────────────
const FormField = ({ icon: Icon, type: initialType, placeholder, name, value, onChange, required }) => {
  const [showPass, setShowPass] = useState(false);
  const type = initialType === 'password' ? (showPass ? 'text' : 'password') : initialType;
  return (
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sage-500 transition-colors duration-300 z-10" size={17} />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3.5 pl-11 pr-11 text-white placeholder-gray-600 outline-none focus:border-sage-600/60 focus:bg-white/[0.07] transition-all duration-300 text-sm font-medium"
      />
      {initialType === 'password' && (
        <button type="button" onClick={() => setShowPass(!showPass)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors z-10">
          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  );
};

// ── Main Login Component ──────────────────────────────────
const Login = ({ setUser }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState(0);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const role = ROLES[selectedRole];
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Particle positions (deterministic to avoid layout shift)
  const particles = [
    { x: 15, y: 20, size: 4, delay: 0 },
    { x: 75, y: 15, size: 6, delay: 1.2 },
    { x: 30, y: 70, size: 3, delay: 2.1 },
    { x: 85, y: 60, size: 5, delay: 0.7 },
    { x: 55, y: 85, size: 4, delay: 3 },
    { x: 10, y: 50, size: 3, delay: 1.8 },
    { x: 92, y: 35, size: 5, delay: 2.5 },
    { x: 45, y: 10, size: 3, delay: 0.4 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'register' && form.password !== form.confirm) return toast.error('Passwords do not match!');
    setLoading(true);
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login'
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password, role: role.id };
    try {
      const res = await api.post(endpoint, payload);
      const user = res.data.user;
      if (mode === 'login' && user.role !== role.id) {
        toast.error(`Wrong portal! This is a ${user.role} account.`);
        setLoading(false); return;
      }
      toast.success(`Welcome, ${user.name}!`);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (roleId) => {
    setDemoLoading(roleId);
    try {
      const res = await api.post('/api/auth/login', { email: `${roleId}@demo.com`, password: 'password123' });
      const user = res.data.user;
      toast.success(`Demo: Welcome ${user.name}!`);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch { toast.error('Demo login failed.'); }
    finally { setDemoLoading(null); }
  };

  return (
    <div className="min-h-screen w-full bg-[#060c05] flex overflow-hidden relative">

      {/* ────────────────────────────────────────────────
          LEFT PANEL — Stunning Visual
      ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden">

        {/* Deep layered background */}
        <div className="absolute inset-0 bg-[#050a04]" />

        {/* Animated mesh gradient bg */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${selectedRole}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            style={{
              background: `radial-gradient(ellipse at 30% 60%, ${role.color}18 0%, transparent 55%),
                           radial-gradient(ellipse at 75% 20%, ${role.color}10 0%, transparent 50%),
                           radial-gradient(ellipse at 10% 90%, rgba(132,177,121,0.06) 0%, transparent 45%)`
            }}
          />
        </AnimatePresence>

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'radial-gradient(rgba(162,203,139,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Diagonal light beams */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-[20%] w-[1px] h-full opacity-[0.06]"
            style={{ background: `linear-gradient(to bottom, transparent, ${role.color}, transparent)` }}
            animate={{ opacity: [0.06, 0.14, 0.06] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-0 left-[60%] w-[1px] h-full opacity-[0.04]"
            style={{ background: `linear-gradient(to bottom, transparent, ${role.color}, transparent)` }}
            animate={{ opacity: [0.04, 0.1, 0.04] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          />
          {/* Horizontal beam */}
          <motion.div
            className="absolute left-0 top-[45%] h-[1px] w-full opacity-[0.05]"
            style={{ background: `linear-gradient(to right, transparent, ${role.color}, transparent)` }}
            animate={{ opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />
        </div>

        {/* Corner accents */}
        <div className="absolute top-8 right-8 w-20 h-20 pointer-events-none opacity-25">
          <div className="absolute top-0 right-0 w-full h-[1px]" style={{ background: role.color }} />
          <div className="absolute top-0 right-0 w-[1px] h-full" style={{ background: role.color }} />
        </div>
        <div className="absolute bottom-8 left-8 w-20 h-20 pointer-events-none opacity-25">
          <div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ background: role.color }} />
          <div className="absolute bottom-0 left-0 w-[1px] h-full" style={{ background: role.color }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="flex items-center gap-2.5 mb-4"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/8 border border-white/15">
              <Leaf size={16} className="text-sage-400" />
            </div>
            <span className="font-black text-lg text-white tracking-tight">
              Agri<span className="text-sage-400">Cert</span>
            </span>
          </motion.div>

          {/* ── HERO VISUAL — Orb + Rings ── */}
          <div className="flex-1 flex items-center justify-center relative">

            {/* Outer ring 3 (slowest) */}
            <motion.div
              className="absolute rounded-full border"
              style={{ width: 340, height: 340, borderColor: `${role.color}18` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              {/* Ring 3 dot */}
              <div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full -translate-x-1/2"
                style={{ background: role.color, boxShadow: `0 0 10px ${role.color}` }} />
            </motion.div>

            {/* Outer ring 2 */}
            <motion.div
              className="absolute rounded-full border"
              style={{ width: 260, height: 260, borderColor: `${role.color}28` }}
              animate={{ rotate: -360 }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full -translate-x-1/2"
                style={{ background: role.color, opacity: 0.8, boxShadow: `0 0 8px ${role.color}` }} />
            </motion.div>

            {/* Inner ring */}
            <motion.div
              className="absolute rounded-full border"
              style={{ width: 185, height: 185, borderColor: `${role.color}40` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute top-1/2 -right-1 w-1.5 h-1.5 rounded-full -translate-y-1/2"
                style={{ background: role.color }} />
            </motion.div>

            {/* Central orb */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`orb-${selectedRole}`}
                className="relative flex items-center justify-center"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.5, ease }}
              >
                {/* Outer glow rings */}
                <div className="absolute w-36 h-36 rounded-full"
                  style={{ background: `radial-gradient(circle, ${role.color}30, transparent 70%)` }} />
                <motion.div
                  className="absolute w-28 h-28 rounded-full blur-xl"
                  style={{ background: role.color, opacity: 0.18 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Core icon container */}
                <div
                  className="relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl border"
                  style={{
                    background: `linear-gradient(135deg, ${role.color}30, ${role.color}10)`,
                    borderColor: `${role.color}50`,
                    boxShadow: `0 0 60px ${role.color}30, 0 0 120px ${role.color}10, inset 0 1px 0 ${role.color}30`,
                  }}
                >
                  <role.Icon size={40} style={{ color: role.color }} strokeWidth={1.4} />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Floating stat cards */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`cards-${selectedRole}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Top-left badge */}
                <motion.div
                  className="absolute left-0 top-6 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border backdrop-blur-sm"
                  style={{
                    background: `${role.color}12`,
                    borderColor: `${role.color}30`,
                    backdropFilter: 'blur(12px)',
                  }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: role.color }} />
                  <span className="text-xs font-bold text-white/80 whitespace-nowrap">Live Network</span>
                </motion.div>

                {/* Bottom-right stat card */}
                <motion.div
                  className="absolute right-0 bottom-6 px-5 py-3.5 rounded-2xl border backdrop-blur-sm"
                  style={{
                    background: 'rgba(6,12,5,0.7)',
                    borderColor: `${role.color}25`,
                    backdropFilter: 'blur(16px)',
                    boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${role.color}15`,
                  }}
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">Certified Today</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">247</span>
                    <span className="text-xs font-bold" style={{ color: role.color }}>+12%</span>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Role Info Block ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${selectedRole}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease }}
              className="mt-4"
            >
              {/* Role label chip */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-3"
                style={{ background: `${role.color}12`, borderColor: `${role.color}30` }}>
                <role.Icon size={13} style={{ color: role.color }} />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: role.color }}>{role.label} Portal</span>
              </div>

              <h2 className="text-2xl font-black text-white leading-snug mb-1.5">
                {role.tagline}
              </h2>
              <p className="text-sm text-white/40 leading-relaxed mb-4">{role.description}</p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2">
                {role.features.map((f) => (
                  <span key={f} className="px-3 py-1 rounded-full text-[11px] font-semibold border text-white/60"
                    style={{ borderColor: `${role.color}25`, background: `${role.color}08` }}>
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Role Switcher ── */}
          <div className="mt-6 flex flex-col gap-2.5">
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/20 font-bold">Switch Role</p>
            <div className="flex gap-2">
              {ROLES.map((r, i) => (
                <motion.button
                  key={r.id}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSelectedRole(i)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-300"
                  style={{
                    background: i === selectedRole ? `${r.color}18` : 'rgba(255,255,255,0.02)',
                    borderColor: i === selectedRole ? `${r.color}50` : 'rgba(255,255,255,0.06)',
                    boxShadow: i === selectedRole ? `0 0 16px ${r.color}20` : 'none',
                  }}
                >
                  <r.Icon size={15} style={{ color: i === selectedRole ? r.color : 'rgba(255,255,255,0.3)' }} />
                  <span className="text-[9px] font-bold uppercase tracking-widest"
                    style={{ color: i === selectedRole ? r.color : 'rgba(255,255,255,0.25)' }}>
                    {r.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* ────────────────────────────────────────────────
          RIGHT PANEL — Form
      ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 xl:p-12 relative overflow-y-auto">

        {/* Back button */}
        <Link to="/" className="absolute top-8 left-8 z-10">
          <motion.button
            whileHover={{ x: -4, scale: 1.04 }}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-sage-400 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </motion.button>
        </Link>

        {/* Mobile role selector (visible only on mobile) */}
        <div className="lg:hidden w-full max-w-sm mb-8">
          <div className="grid grid-cols-4 gap-2 p-1.5 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
            {ROLES.map((r, i) => (
              <button key={r.id} onClick={() => setSelectedRole(i)}
                className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${i === selectedRole
                  ? 'bg-sage-600 text-white'
                  : 'text-gray-500 hover:text-sage-400'
                  }`}>
                <r.Icon size={16} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm">

          {/* Tab switcher */}
          <div className="flex mb-8 relative">
            <div className="flex gap-0 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-1 w-full">
              {['login', 'register'].map((m) => (
                <motion.button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 relative z-10 ${mode === m ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {mode === m && (
                    <motion.div
                      layoutId="tab-bg"
                      className="absolute inset-0 bg-sage-600/80 border border-sage-600/60 rounded-xl shadow-[0_0_20px_rgba(132,177,121,0.25)]"
                      transition={{ duration: 0.3, ease }}
                    />
                  )}
                  <span className="relative z-10">{m === 'login' ? 'Sign In' : 'Register'}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`heading-${mode}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease }}
              className="mb-7"
            >
              <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                {mode === 'login' ? `Welcome back,` : 'Join AgriCert'}
              </h1>
              <p className="text-sm text-gray-500">
                {mode === 'login'
                  ? `Signing in as ${role.label}`
                  : `Creating a ${role.label} account`}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={`form-${mode}`}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease }}
              className="flex flex-col gap-3.5"
            >
              {mode === 'register' && (
                <FormField icon={User} type="text" placeholder="Full Name" name="name" value={form.name} onChange={handleChange} required />
              )}
              <FormField icon={Mail} type="email" placeholder="Email Address" name="email" value={form.email} onChange={handleChange} required />
              <FormField icon={Lock} type="password" placeholder="Password" name="password" value={form.password} onChange={handleChange} required />
              {mode === 'register' && (
                <FormField icon={Lock} type="password" placeholder="Confirm Password" name="confirm" value={form.confirm} onChange={handleChange} required />
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <button type="button" className="text-xs text-gray-600 hover:text-sage-400 transition-colors">Forgot password?</button>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(132,177,121,0.35)' }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 w-full py-3.5 bg-sage-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(132,177,121,0.25)] hover:bg-sage-500 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading
                  ? <Loader2 size={18} className="animate-spin" />
                  : <>{mode === 'login' ? 'Authenticate' : 'Create Account'} <ArrowRight size={16} /></>
                }
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-700">Quick Demo</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Demo logins */}
          <div className="grid grid-cols-2 gap-2.5">
            {ROLES.map((r) => (
              <motion.button
                key={r.id}
                whileHover={{ scale: 1.03, borderColor: r.color + '50' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loginDemo(r.id)}
                disabled={!!demoLoading}
                className="flex items-center justify-center gap-2 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all duration-300"
              >
                {demoLoading === r.id
                  ? <Loader2 size={13} className="animate-spin" />
                  : <r.Icon size={13} style={{ color: r.color }} />
                }
                {r.label}
              </motion.button>
            ))}
          </div>

          {/* Security notice */}
          <div className="flex items-center justify-center gap-2 mt-8 opacity-40">
            <ShieldCheck size={13} className="text-sage-600" />
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              JWT · Bcrypt · TLS Encrypted
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;