import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Wheat, BrainCircuit, Link as LinkIcon, Gavel, ShoppingCart, ArrowRight, ChevronDown, Upload, FileSearch, Banknote, ShieldCheck, Zap, Layers, Leaf, Map, Database } from 'lucide-react';

const supplyChainSteps = [
  { id: 1, title: "Farm", icon: Wheat, desc: "Sourcing" },
  { id: 2, title: "AI Certification", icon: BrainCircuit, desc: "Quality AI" },
  { id: 3, title: "Blockchain Record", icon: LinkIcon, desc: "Immutable" },
  { id: 4, title: "Live Auction", icon: Gavel, desc: "Market" },
  { id: 5, title: "Verified Product", icon: ShoppingCart, desc: "Consumer" }
];

// Ultra-smooth easing curve
const smoothCurve = [0.16, 1, 0.3, 1];

const TextReveal = ({ text, className, delay = 0 }) => {
  const words = text.split(" ");
  return (
    <div className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: delay + i * 0.08, ease: smoothCurve }}
          className="mr-3 block mb-1"
        >
          {word === "Agriculture," || word === "AI" || word === "Blockchain." ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-200 drop-shadow-sm">
              {word}
            </span>
          ) : word}
        </motion.span>
      ))}
    </div>
  );
};

const AnimatedCounter = ({ from = 0, to, duration = 3, suffix = "" }) => {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        // Cubic ease out
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * (to - from) + from));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [inView, to, from, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// Simplified Blob for better performance
const FloatingBlob = ({ className, delay = 0, duration = 15, animateTo }) => (
  <motion.div
    className={`absolute rounded-full mix-blend-screen filter blur-[120px] opacity-[0.2] pointer-events-none ${className}`}
    animate={{ x: animateTo.x, y: animateTo.y }}
    transition={{ duration, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut", delay }}
  />
);

const Landing = () => {
  const { scrollYProgress, scrollY } = useScroll();
  const opacityHero = useTransform(scrollY, [0, 600], [1, 0]);
  const lineDraw = useTransform(scrollY, [0, 800], ["0%", "100%"]); // Sync line with scroll

  return (
    <div className="min-h-screen bg-[#030603] text-white font-sans overflow-x-hidden selection:bg-green-500/30">

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-teal-400 to-emerald-500 origin-left z-[100]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Extremely subtle ambient grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] md:bg-[size:4rem_4rem]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#030603] via-transparent to-[#030603] opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#030603] via-transparent to-[#030603] opacity-60"></div>

        <FloatingBlob className="top-[-10%] right-[10%] w-[500px] h-[500px] bg-green-700" delay={0} duration={12} animateTo={{ x: [0, -30, 0], y: [0, 50, 0] }} />
        <FloatingBlob className="bottom-[10%] left-[5%] w-[400px] h-[400px] bg-emerald-700" delay={2} duration={15} animateTo={{ x: [0, 50, 0], y: [0, -40, 0] }} />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 1, ease: smoothCurve }}
        className="fixed top-0 w-full z-50 bg-[#030603]/60 backdrop-blur-xl border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-700"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-xl">
                <ShieldCheck size={22} className="group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <span className="text-xl font-black tracking-tight text-white">Agri<span className="text-green-400">Cert</span></span>
          </Link>

          <div className="flex gap-6 items-center">
            <Link to="/login" className="hidden sm:block text-sm font-semibold text-gray-400 hover:text-green-400 transition-colors">
              Login
            </Link>
            <Link to="/portal">
              <button className="relative group px-6 py-2.5 rounded-full overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.1)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all duration-500 bg-[#08120B] border border-green-500/20">
                <span className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-500/20 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative z-10 text-white font-bold text-sm tracking-wide group-hover:text-green-300 transition-colors">Launch App</span>
              </button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* --- HERO SECTION --- */}
      <div className="relative z-10 min-h-screen pt-28 pb-10 flex flex-col justify-center overflow-hidden">
        <motion.div style={{ opacity: opacityHero }} className="max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row gap-16 lg:gap-8 items-center justify-center flex-1">

          {/* LEFT SIDE: Typography */}
          <div className="flex-1 flex flex-col items-start text-left space-y-8 z-20 w-full lg:max-w-xl xl:max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: smoothCurve }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}></span>
              <span className="text-xs font-mono uppercase tracking-widest text-green-300/90 font-semibold">Live on Polygon Web3</span>
            </motion.div>

            <div className="text-5xl sm:text-6xl md:text-7xl lg:text-[4.5rem] xl:text-[5rem] font-extrabold tracking-tight leading-[1.05]">
              <TextReveal text="Trust in Agriculture," delay={0.2} />
              <TextReveal text="Verified by AI" delay={0.4} />
              <TextReveal text="& Blockchain." delay={0.6} />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.9, ease: smoothCurve }}
              className="text-lg md:text-xl text-gray-400/90 max-w-lg leading-relaxed pl-5 border-l-2 border-green-500/40"
            >
              The world's first decentralized supply chain protocol.
              Powered by <strong className="text-white font-semibold flex items-center gap-1 inline-flex"><Zap size={16} className="text-green-400" />OCR AI Analysis</strong>, immutable ledgers, and real-time marketplaces.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1, ease: smoothCurve }}
              className="flex flex-col sm:flex-row items-center gap-5 pt-4 w-full sm:w-auto"
            >
              <Link to="/portal" className="w-full sm:w-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-700"></div>
                <button className="relative w-full px-8 py-4 bg-[#050B07] border border-white/10 group-hover:border-green-500/40 rounded-2xl font-bold text-white transition-all duration-500 flex items-center justify-center gap-3">
                  <span className="relative z-10 flex items-center gap-2 text-[15px]">Explore Platform <ArrowRight className="group-hover:translate-x-1.5 transition-transform duration-500 ease-out" size={18} /></span>
                </button>
              </Link>
              <Link to="/verify" className="w-full sm:w-auto justify-center px-8 py-4 bg-transparent hover:bg-white/5 border border-white/10 rounded-2xl font-bold text-white transition-all flex items-center gap-3 text-[15px] group">
                <FileSearch size={18} className="text-teal-400 group-hover:scale-110 transition-transform duration-500" /> Verify Product
              </Link>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Perfected Supply Chain Timeline */}
          <div className="flex-1 w-full lg:w-auto relative py-10 flex items-center justify-center min-h-[500px] z-10">

            {/* Strict Grid Layout for perfect alignment */}
            <div className="relative z-20 w-fit mx-auto lg:ml-auto lg:mr-0 pl-12 sm:pl-0">

              {/* The Golden Thread (Connected Line) */}
              <div className="absolute top-8 bottom-8 left-4 sm:left-1/2 sm:-translate-x-1/2 w-[2px] bg-green-900/30 z-0">
                <motion.div
                  className="w-full bg-gradient-to-b from-green-400 via-emerald-400 to-teal-400 shadow-[0_0_15px_#4ade80]"
                  style={{ height: lineDraw }}
                />
                {/* Floating glowing dot on path */}
                <motion.div
                  className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff] absolute left-[-3px]"
                  style={{ top: lineDraw }}
                />
              </div>

              <div className="flex flex-col gap-12 sm:gap-14 relative z-10 w-full sm:w-[420px]">
                {supplyChainSteps.map((step, i) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: i * 0.15, ease: smoothCurve }}
                    className={`relative flex items-center justify-between w-full group ${i % 2 !== 0 ? 'sm:flex-row-reverse' : ''}`}
                  >

                    {/* Desktop Text Block (Strict 40% width) */}
                    <div className={`hidden sm:flex flex-col justify-center w-[40%] ${i % 2 !== 0 ? 'items-start text-left' : 'items-end text-right'}`}>
                      <h3 className="text-lg font-bold text-white/90 group-hover:text-green-300 transition-colors drop-shadow-sm whitespace-nowrap">
                        {step.title}
                      </h3>
                      <p className="text-[10px] text-green-500/80 font-mono uppercase tracking-widest mt-1">
                        {step.desc}
                      </p>
                    </div>

                    {/* Center Node (Strict Fixed Dimension) */}
                    <div className="absolute left-[-2.5rem] sm:static sm:left-auto w-12 h-12 rounded-full bg-[#050A06] border border-green-500/30 flex items-center justify-center shrink-0 shadow-lg group-hover:border-green-400 group-hover:bg-green-900/40 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-500 z-10">
                      <step.icon size={18} className="text-green-400 group-hover:text-white transition-colors relative z-10" />
                    </div>

                    {/* Mobile Text block */}
                    <div className="flex sm:hidden flex-col justify-center w-full pl-6">
                      <h3 className="text-base font-bold text-white/90">{step.title}</h3>
                      <p className="text-[10px] text-green-500/80 font-mono uppercase tracking-widest">{step.desc}</p>
                    </div>

                    {/* Spacer (Strict 40% width to balance) */}
                    <div className="hidden sm:block w-[40%]"></div>

                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 hover:text-green-400 cursor-pointer transition-colors z-20"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest">Discover</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
            <ChevronDown size={20} className="opacity-70" />
          </motion.div>
        </motion.div>
      </div>

      {/* --- INFINITE MARQUEE --- */}
      <div className="py-5 border-y border-white/[0.03] bg-[#050A06] overflow-hidden relative z-20">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#030603] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#030603] to-transparent z-10 pointer-events-none"></div>
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="flex gap-24 whitespace-nowrap min-w-max px-10 items-center opacity-60"
        >
          {[...Array(2)].fill(['SECURED ALGORITHMS', 'TESSERACT OCR AI PROCESSING', 'POLYGON SMART CONTRACTS', 'REAL-TIME WEBSOCKET AUCTIONS', 'ZERO-TRUST ARCHITECTURE']).flat().map((text, i) => (
            <div key={i} className="flex items-center gap-3">
              <Zap className="text-green-600" size={14} />
              <span className="text-sm font-bold font-mono tracking-widest text-white/70">{text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* --- METRICS / COUNTERS --- */}
      <div className="py-20 relative z-10 bg-[#020402]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-white/5 md:divide-x">
          {[
            { label: "Network Uptime", value: 99.9, suffix: "%" },
            { label: "AI Prediction Accuracy", value: 97, suffix: "%" },
            { label: "Ledger Transactions", value: 500, suffix: "k+" },
            { label: "Active Certifiers", value: 124, suffix: "" }
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1, delay: i * 0.1, ease: smoothCurve }}
              className="flex flex-col items-center"
            >
              <h4 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(34,197,94,0.15)] tracking-tighter">
                <AnimatedCounter from={0} to={metric.value} duration={2.5} suffix={metric.suffix} />
              </h4>
              <p className="text-gray-500 mt-3 font-mono text-[10px] md:text-[11px] uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- SCROLL CHAPTERS --- */}
      <div className="relative z-10 pt-20 pb-32 px-6 bg-[#030603]">
        <div className="max-w-6xl mx-auto space-y-32">
          <Chapter
            num="01" title="Farm Registration"
            desc="Farmers securely register their crop batches directly from the field. Important inspection documents detailing moisture content, weight, and geographical origin are uploaded instantly."
            icon={Map} align="left"
          />
          <Chapter
            num="02" title="OCR AI Pipeline"
            desc="Certifiers scan the uploaded lab reports. Our advanced computer vision engine extracts critical metadata, evaluates quality, and auto-generates prediction grades without manual entry."
            icon={Layers} align="right"
          />
          <Chapter
            num="03" title="Immutable Ledger"
            desc="Upon certifier approval, a unique cryptographic hash of the crop profile is minted directly onto the Polygon blockchain, ensuring the record can never be tampered with or forged."
            icon={Database} align="left"
          />
          <Chapter
            num="04" title="Live Marketplace"
            desc="Certified batches automatically enter the real-time websocket auction room. Distributors and buyers lock in dynamic competitive bids via instant data streams."
            icon={Banknote} align="right"
          />
          <Chapter
            num="05" title="Consumer Traceability"
            desc="Transparency at the store level. Consumers can enter the Product ID to trace its exact lineage, viewing the authenticated OCR lab results and the underlying immutable blockchain transaction hash."
            icon={Leaf} align="left"
          />
        </div>
      </div>

      {/* --- FOOTER CTA & FOOTER --- */}
      <div className="relative pt-32 pb-10 border-t border-white/5 bg-[#020402] px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-900/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: smoothCurve }} viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight text-white drop-shadow-xl">
              Cultivate Trust,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300 drop-shadow-sm">Seamlessly.</span>
            </h2>
            <div className="flex justify-center mt-6">
              <Link to="/portal" className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-white text-black rounded-full font-bold text-base hover:scale-105 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.25)]">
                Start Your Journey <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Clean Modern Footer */}
        <div className="relative z-10 max-w-7xl mx-auto border-t border-white/[0.05] pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
            <ShieldCheck size={18} className="text-green-500" />
            <span className="text-base font-black tracking-tight text-white">Agri<span className="text-green-400">Cert</span></span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-gray-500 font-medium">
            <a href="#" className="hover:text-green-400 transition-colors duration-300">Platform</a>
            <a href="#" className="hover:text-green-400 transition-colors duration-300">Whitepaper</a>
            <a href="#" className="hover:text-green-400 transition-colors duration-300">Privacy</a>
            <a href="#" className="hover:text-green-400 transition-colors duration-300">GitHub</a>
          </div>

          <div className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">
            © {new Date().getFullYear()} AGRICERT SECURED.
          </div>
        </div>
      </div>

    </div>
  );
};

// Polished Chapter Component
const Chapter = ({ num, title, desc, icon: Icon, align }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: smoothCurve }}
      className={`flex flex-col md:flex-row gap-10 lg:gap-20 items-center ${align === 'right' ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Graphic Side */}
      <div className="flex-1 w-full relative group perspective-1000">
        {/* The Outer Ambient Glow (Only visible on hover) */}
        <div className="absolute -inset-2 bg-gradient-to-r from-green-500/0 to-teal-500/0 blur-[60px] rounded-full group-hover:from-green-500/20 group-hover:to-teal-500/20 transition-all duration-1000"></div>

        {/* The Card */}
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-[32px] aspect-[4/3] bg-[#060D08] border border-white/[0.05] flex items-center justify-center overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-10"
        >
          {/* Extremely Subtle Internal Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>

          {/* Base Radial Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.05),transparent_70%)] opacity-50"></div>

          {/* Hover Responsive Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-green-500/10 rounded-full blur-[40px] group-hover:bg-green-400/20 group-hover:scale-150 transition-all duration-700"></div>

          <Icon size={100} className="text-white/10 group-hover:text-green-400 drop-shadow-none group-hover:drop-shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-700 relative z-20" strokeWidth={1} />
        </motion.div>
      </div>

      {/* Text Side */}
      <div className={`flex-1 w-full space-y-5 ${align === 'right' ? 'md:text-right' : 'md:text-left'} z-20`}>
        <span className="inline-block px-4 py-1.5 rounded-full border border-green-500/20 text-green-400 font-mono tracking-widest text-[10px] font-semibold bg-green-500/5 shadow-sm">
          STAGE {num}
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
          {title}
        </h2>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-lg mx-auto md:mx-0">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

export default Landing;