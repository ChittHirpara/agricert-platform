import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  Wheat, BrainCircuit, Link as LinkIcon, Gavel, ShoppingCart,
  ArrowRight, ChevronDown, FileSearch, ShieldCheck, Zap, Leaf,
  ScanLine, Globe, TrendingUp, Lock, Star, CheckCircle2,
  Microscope, Package, Award, BarChart3, Users, Layers
} from 'lucide-react';

// ─────────────────── Constants ───────────────────
const ease = [0.16, 1, 0.3, 1];

const NAV_LINKS = ['Platform', 'How It Works', 'Market', 'Security'];

const STATS = [
  { value: 99.9, suffix: '%', label: 'Uptime SLA' },
  { value: 97, suffix: '%', label: 'AI Accuracy' },
  { value: 500, suffix: 'k+', label: 'Transactions' },
  { value: 124, suffix: '', label: 'Certifiers' },
];

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'OCR AI Pipeline',
    desc: 'Tesseract-powered document analysis extracts moisture, weight, and grade from lab reports in seconds — zero manual entry.',
    tag: 'Computer Vision',
  },
  {
    icon: Lock,
    title: 'Cryptographic Seal',
    desc: 'SHA-256 hash of every certification minted on Polygon Amoy. Immutable. Unforgeable. Verifiable in 3 seconds with a QR scan.',
    tag: 'Blockchain',
  },
  {
    icon: Gavel,
    title: 'Live Auction Room',
    desc: 'WebSocket-powered real-time bidding on certified batches. Distributors lock in competitive prices across global time zones.',
    tag: 'Real-Time',
  },
  {
    icon: ScanLine,
    title: 'Instant QR Verify',
    desc: 'Consumer scans a QR code, sees the full cryptographic audit trail and lab data in milliseconds. Zero friction, full trust.',
    tag: 'Traceability',
  },
  {
    icon: Globe,
    title: 'Global Marketplace',
    desc: 'Browse certified batches from 40+ countries. Filter by crop type, grade, origin, and sustainability metrics.',
    tag: 'Network',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Real-time data on batch performance, certification velocity, and market trends — visualized in exportable charts.',
    tag: 'Intelligence',
  },
];

const HOW_IT_WORKS = [
  { num: '01', icon: Wheat, title: 'Farmer Registers Batch', desc: 'Upload crop metadata, origin, and inspection documents directly from the field via mobile or desktop.' },
  { num: '02', icon: Microscope, title: 'AI OCR Inspection', desc: 'Our engine scans lab reports, extracts quality parameters, and produces an AI grade prediction.' },
  { num: '03', icon: Lock, title: 'Certifier Signs On-Chain', desc: 'Accredited QA agencies approve the batch. A cryptographic hash is minted on Polygon — permanent and tamper-proof.' },
  { num: '04', icon: Gavel, title: 'Live Auction Begins', desc: 'Certified batches enter the real-time marketplace. Distributors bid via WebSocket, prices settle at market rate.' },
  { num: '05', icon: CheckCircle2, title: 'Consumer Verifies', desc: 'Scan the product QR code to instantly verify authenticity, view the full supply chain, and check the on-chain record.' },
];

const TESTIMONIALS = [
  { name: 'Rajiv Mehta', role: 'Export Manager, GreenHarvest Ltd.', rating: 5, text: 'AgriCert cut our certification time from 10 days to 36 hours. Customs clearance is now seamless.' },
  { name: 'Dr. Priya Shankar', role: 'Chief Quality Officer, SafeGrain Agency', rating: 5, text: 'The OCR pipeline eliminates manual data entry errors. Our audit trail is airtight and instantly provable.' },
  { name: 'Liu Wei', role: 'Senior Buyer, Pacific Imports Co.', rating: 5, text: 'I verify every shipment with a QR scan before payment. This is the future of agricultural trade.' },
];

// ─────────────────── Small Reusable Components ───────────────────
const AnimatedCounter = ({ to, suffix = '', duration = 2.5 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
};

const Tag = ({ children }) => (
  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-sage-600/15 text-sage-500 border border-sage-600/20">
    {children}
  </span>
);

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: rating }).map((_, i) => (
      <Star key={i} size={12} className="text-sage-500 fill-sage-500" />
    ))}
  </div>
);

// ─────────────────── Main Component ───────────────────
const Landing = () => {
  const { scrollYProgress, scrollY } = useScroll();
  const [activeStep, setActiveStep] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, -60]);

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setNavScrolled(v > 20));
    return unsub;
  }, [scrollY]);

  useEffect(() => {
    const id = setInterval(() => setActiveStep(s => (s + 1) % HOW_IT_WORKS.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#060c05] text-white font-sans overflow-x-hidden">

      {/* ── Scroll Progress Bar ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sage-600 via-sage-500 to-sage-300 origin-left z-[200]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ── Background Canvas ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle dot grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(rgba(132,177,121,0.18) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060c05] via-transparent to-[#060c05]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060c05] via-transparent to-[#060c05]" />
        {/* Floating glows */}
        <motion.div
          className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #84B179 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #A2CB8B 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
      </div>

      {/* ════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${navScrolled
          ? 'bg-[#060c05]/90 backdrop-blur-2xl border-b border-sage-600/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-sage-600/15 border border-sage-600/30 group-hover:border-sage-500/50 transition-all">
              <Leaf size={18} className="text-sage-500" />
              <div className="absolute inset-0 rounded-xl bg-sage-600/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-lg font-black tracking-tight">
              Agri<span className="text-sage-500">Cert</span>
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm font-medium text-gray-400 hover:text-sage-400 transition-colors duration-300"
              >
                {link}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link to="/portal" className="hidden sm:block text-sm font-semibold text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/portal">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 rounded-xl bg-sage-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(132,177,121,0.3)] hover:bg-sage-500 hover:shadow-[0_0_30px_rgba(162,203,139,0.4)] transition-all duration-300"
              >
                Get Started →
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 text-center">
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="max-w-5xl mx-auto">

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-sage-600/10 border border-sage-600/25 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-600" />
            </span>
            <span className="text-xs font-semibold font-mono uppercase tracking-widest text-sage-400">
              Live · Polygon Web3 · 124 certifiers
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.35, ease }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] mb-6"
          >
            Agricultural Trust,
            <br />
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 via-sage-500 to-sage-300">
                Cryptographically
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-300 via-sage-500 to-sage-600">
                Guaranteed.
              </span>
              {/* Underline glow */}
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sage-500 to-transparent rounded-full"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ duration: 1.4, delay: 1.2, ease }}
              />
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            From farm to consumer — AI-powered inspection, immutable blockchain certificates,
            and live auctions in a single unified platform.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/portal">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(162,203,139,0.4)' }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center gap-3 px-8 py-4 bg-sage-600 text-white rounded-2xl font-bold text-base shadow-[0_0_24px_rgba(132,177,121,0.35)] transition-all duration-300 hover:bg-sage-500"
              >
                Launch Platform
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link to="/consumer-verify">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center gap-3 px-8 py-4 bg-white/5 border border-sage-600/25 text-white rounded-2xl font-bold text-base backdrop-blur-md hover:bg-white/8 hover:border-sage-500/40 transition-all duration-300"
              >
                <FileSearch size={18} className="text-sage-400" />
                Verify a Product
              </motion.button>
            </Link>
          </motion.div>

          {/* Trusted by line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="mt-8 text-xs font-mono text-gray-600 uppercase tracking-widest"
          >
            Trusted by exporters in 40+ countries · ISO 9001 compatible
          </motion.p>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-gray-600 hover:text-sage-500 cursor-pointer transition-colors"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-[9px] font-mono uppercase tracking-[0.25em]">Scroll</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ChevronDown size={18} />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          LOGO MARQUEE
      ════════════════════════════════════════ */}
      <div className="relative z-10 py-6 border-y border-white/[0.04] bg-[#06100a]/60 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#060c05] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#060c05] to-transparent z-10" />
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="flex gap-16 whitespace-nowrap w-max items-center"
        >
          {[...Array(2)].fill([
            'TESSERACT OCR AI', 'POLYGON BLOCKCHAIN', 'REAL-TIME WEBSOCKETS',
            'SHA-256 CERTIFICATES', 'ISO 9001 COMPLIANT', 'ZERO-TRUST SECURITY',
            'LIVE AUCTION ROOM', 'GLOBAL TRACEABILITY',
          ]).flat().map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 opacity-35">
              <div className="w-1 h-1 rounded-full bg-sage-600" />
              <span className="text-xs font-bold font-mono tracking-widest text-white">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ════════════════════════════════════════
          STATS
      ════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: i * 0.1, ease }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] hover:border-sage-600/25 transition-all duration-500 p-8 text-center"
              >
                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                  <AnimatedCounter to={s.value} suffix={s.suffix} />
                </div>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">{s.label}</p>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sage-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES GRID
      ════════════════════════════════════════ */}
      <section id="platform" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease }}
            className="text-center mb-16"
          >
            <Tag>Platform Capabilities</Tag>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4 tracking-tight">
              Everything the chain needs.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 to-sage-300">Nothing it doesn't.</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A vertically integrated platform built for modern agricultural trade — from the field to the import desk.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: i * 0.08, ease }}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col gap-4 p-7 rounded-2xl border border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.045] hover:border-sage-600/25 transition-all duration-500 cursor-default overflow-hidden"
              >
                {/* Icon */}
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-sage-600/15 border border-sage-600/25 group-hover:bg-sage-600/25 transition-all duration-400">
                  <f.icon size={22} className="text-sage-500" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-lg">{f.title}</h3>
                    <Tag>{f.tag}</Tag>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
                {/* Corner glow */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: 'radial-gradient(circle at top right, rgba(132,177,121,0.12), transparent 70%)' }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS — Interactive Steps
      ════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-28 px-6 bg-[#050a04]/70">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease }}
            className="text-center mb-16"
          >
            <Tag>The Protocol</Tag>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4 tracking-tight">
              5 steps from field
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-500 to-sage-300">to verified shelf.</span>
            </h2>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Step Nav */}
            <div className="lg:w-2/5 flex flex-col gap-2">
              {HOW_IT_WORKS.map((s, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  whileHover={{ x: 4 }}
                  className={`relative flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-400 border ${activeStep === i
                    ? 'bg-sage-600/15 border-sage-600/35 shadow-[0_0_20px_rgba(132,177,121,0.1)]'
                    : 'bg-white/[0.02] border-white/[0.05] hover:border-white/10'
                    }`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-400 ${activeStep === i
                    ? 'bg-sage-600/30 border-sage-500/50 text-sage-300'
                    : 'bg-white/5 border-white/10 text-gray-500'
                    }`}>
                    <s.icon size={18} />
                  </div>
                  <div>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${activeStep === i ? 'text-sage-500' : 'text-gray-600'}`}>
                      Step {s.num}
                    </span>
                    <p className={`font-bold text-sm transition-colors ${activeStep === i ? 'text-white' : 'text-gray-400'}`}>
                      {s.title}
                    </p>
                  </div>
                  {activeStep === i && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-sage-500 rounded-full" />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Detail Panel */}
            <div className="lg:w-3/5 sticky top-24">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease }}
                  className="relative overflow-hidden rounded-3xl border border-sage-600/20 bg-gradient-to-br from-white/[0.04] to-sage-900/10 p-10"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.08]"
                    style={{ background: 'radial-gradient(circle at top right, #84B179, transparent 60%)' }} />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-sage-600/20 border border-sage-600/35 flex items-center justify-center">
                        {React.createElement(HOW_IT_WORKS[activeStep].icon, { size: 28, className: 'text-sage-400' })}
                      </div>
                      <div>
                        <span className="text-xs font-mono text-sage-600 uppercase tracking-widest font-bold">
                          Stage {HOW_IT_WORKS[activeStep].num}
                        </span>
                        <h3 className="text-2xl font-black text-white">
                          {HOW_IT_WORKS[activeStep].title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed mb-8">
                      {HOW_IT_WORKS[activeStep].desc}
                    </p>

                    {/* Progress dots */}
                    <div className="flex gap-2">
                      {HOW_IT_WORKS.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveStep(i)}
                          className={`h-1.5 rounded-full transition-all duration-400 ${i === activeStep ? 'w-8 bg-sage-500' : 'w-1.5 bg-white/20'}`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          ROLE CARDS
      ════════════════════════════════════════ */}
      <section id="market" className="relative z-10 py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease }}
            className="text-center mb-16"
          >
            <Tag>Who It's For</Tag>
            <h2 className="text-4xl md:text-5xl font-black mt-4 tracking-tight">
              Built for the entire
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 to-sage-300"> supply chain.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Wheat, role: 'Farmer / Exporter', color: 'from-sage-900/40 to-sage-800/20',
                points: ['One-click batch creation', 'Real-time status tracking', 'Auction access for certified lots', 'Digital export certificates'],
              },
              {
                icon: Award, role: 'QA Certifier Agency', color: 'from-sage-800/40 to-sage-700/20',
                points: ['AI-assisted OCR inspection', 'Cryptographic signing tools', 'Immutable audit trail', 'Agency branded certificates'],
              },
              {
                icon: Package, role: 'Importer / Customs', color: 'from-sage-700/30 to-sage-600/10',
                points: ['3-second QR verification', 'On-chain record access', 'Direct purchase orders', 'Port-to-port shipment tracking'],
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.12, ease }}
                whileHover={{ y: -8, scale: 1.01 }}
                className={`relative overflow-hidden flex flex-col gap-6 p-8 rounded-3xl border border-sage-600/20 bg-gradient-to-br ${card.color} cursor-default group`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-sage-600/20 border border-sage-500/30 flex items-center justify-center">
                    <card.icon size={24} className="text-sage-400" />
                  </div>
                  <h3 className="text-xl font-black text-white">{card.role}</h3>
                </div>
                <ul className="flex flex-col gap-3">
                  {card.points.map((pt, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle2 size={15} className="text-sage-500 shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <Link to="/portal">
                  <button className="mt-auto flex items-center gap-2 text-sm font-bold text-sage-400 hover:text-sage-300 transition-colors group/btn">
                    Get started <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </Link>
                {/* glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(132,177,121,0.07), transparent 60%)' }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 bg-[#050a04]/70">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease }}
            className="text-center mb-14"
          >
            <Tag>Testimonials</Tag>
            <h2 className="text-4xl md:text-5xl font-black mt-4 tracking-tight">
              Trusted by those
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-500 to-sage-300"> who ship the world.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease }}
                className="flex flex-col gap-5 p-7 rounded-3xl border border-white/[0.06] bg-white/[0.025] hover:border-sage-600/20 transition-all duration-400"
              >
                <StarRating rating={t.rating} />
                <p className="text-gray-300 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="border-t border-white/5 pt-4">
                  <p className="font-bold text-white text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECURITY SECTION
      ════════════════════════════════════════ */}
      <section id="security" className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease }}
            className="relative overflow-hidden rounded-3xl border border-sage-600/20 bg-gradient-to-br from-sage-900/30 to-[#060c05] p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, #84B179, transparent 60%)' }} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-sage-600/20 border border-sage-600/30 flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={28} className="text-sage-500" />
              </div>
              <Tag>Enterprise Security</Tag>
              <h2 className="text-3xl md:text-5xl font-black mt-4 mb-4 tracking-tight">
                Zero-trust architecture.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-500 to-sage-300">Production-grade from day one.</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-10">
                JWT + Bcrypt authentication, Helmet HTTP headers, rate limiting, CORS whitelisting, and Polygon-anchored cryptographic proofs.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {['JWT Auth', 'Bcrypt Hashing', 'Rate Limiting', 'CORS Policy', 'SHA-256 Proof', 'Polygon Anchor'].map((item) => (
                  <span key={item} className="px-4 py-2 rounded-full border border-sage-600/25 bg-sage-600/10 text-sage-400 text-xs font-bold font-mono uppercase tracking-wide">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease }}
          >
            <Tag>Start Now</Tag>
            <h2 className="text-5xl md:text-7xl font-black mt-6 mb-6 tracking-tight leading-[1.01]">
              Cultivate Trust.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 via-sage-500 to-sage-300">
                Scale Globally.
              </span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-10 text-lg">
              Join 124+ certified agencies and thousands of exporters who have moved beyond paper.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/portal">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(162,203,139,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-4 bg-sage-600 text-white rounded-2xl font-black text-base shadow-[0_0_30px_rgba(132,177,121,0.3)] hover:bg-sage-500 transition-all duration-300 flex items-center gap-3"
                >
                  Start Free <ArrowRight size={18} />
                </motion.button>
              </Link>
              <a href="mailto:support@agricert.tech">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  className="px-10 py-4 border border-sage-600/25 text-sage-400 rounded-2xl font-bold text-base hover:bg-sage-600/10 transition-all duration-300"
                >
                  Contact Sales
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/[0.05] bg-[#050a04]/80 px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-sage-600/15 border border-sage-600/25">
              <Leaf size={15} className="text-sage-500" />
            </div>
            <span className="font-black tracking-tight">Agri<span className="text-sage-500">Cert</span></span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-gray-500">
            {['Platform', 'Whitepaper', 'Privacy', 'GitHub', 'Status', 'Support'].map((link) => (
              <a key={link} href="#" className="hover:text-sage-400 transition-colors duration-300">{link}</a>
            ))}
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
              © {new Date().getFullYear()} AgriCert · All rights reserved.
            </span>
            <span className="text-[10px] text-gray-700 font-mono">Built with ❤️ for global food security.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;