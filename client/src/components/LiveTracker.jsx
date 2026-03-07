import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Satellite, Thermometer, Droplets, Navigation, Wifi, Truck, Map, Globe } from 'lucide-react';

const LiveTracker = ({ batch, onClose }) => {
  // Simulate Live Sensor Data
  const [temp, setTemp] = useState(24.0);
  const [humidity, setHumidity] = useState(60);
  const [lat, setLat] = useState(28.6139); // Default Delhi
  const [lng, setLng] = useState(77.2090);
  const [progress, setProgress] = useState(0);

  // "Geocoding" Simulation (We use the Location name to generate a region code)
  const regionCode = batch.location.substring(0,3).toUpperCase() + "-ZN" + Math.floor(Math.random() * 99);

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomize Sensor Data to look "Live"
      setTemp(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1));
      setHumidity(prev => Math.floor(prev + (Math.random() * 2 - 1)));
      
      // Simulate GPS movement
      setLat(prev => prev + 0.0001);
      setLng(prev => prev + 0.0001);
      
      // Move the truck progress bar
      setProgress(prev => (prev < 100 ? prev + 0.2 : 0));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-6xl bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh]"
      >
        
        {/* LEFT: THE REAL MAP INTERFACE */}
        <div className="relative w-full md:w-3/4 bg-black overflow-hidden group">
          
          {/* REAL GOOGLE MAPS EMBED (SATELLITE MODE) */}
          {/* We inject the batch.location into the URL query */}
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight="0" 
            marginWidth="0" 
            className="opacity-60 grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(batch.location)}&t=k&z=13&ie=UTF8&iwloc=&output=embed`}
          ></iframe>

          {/* UI OVERLAY (The "Spy" Look) */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
            
            {/* Central Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-green-500/50 rounded-full flex items-center justify-center">
               <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
            </div>

            {/* Path Simulation Line (SVG) */}
            <svg className="absolute inset-0 w-full h-full">
               <path d="M 100 400 Q 400 200 800 300" stroke="#22c55e" strokeWidth="2" fill="none" strokeDasharray="10,10" className="opacity-50" />
            </svg>

            {/* Moving Truck Icon */}
            <div 
              className="absolute top-1/2 left-1/2 transition-all duration-500"
              style={{ transform: `translate(${Math.sin(progress/10) * 100}px, ${Math.cos(progress/10) * 50}px)` }}
            >
               <div className="bg-green-600 p-2 rounded-full shadow-[0_0_30px_#22c55e] border border-white">
                 <Truck size={24} className="text-white" />
               </div>
               <div className="absolute top-10 left-0 bg-black/80 text-green-400 text-[10px] px-2 py-1 rounded border border-green-500/30 whitespace-nowrap">
                 ID: {batch._id.substring(0,6)}
               </div>
            </div>

            {/* Location Info Badge */}
            <div className="absolute bottom-8 left-8 bg-black/70 backdrop-blur border-l-4 border-green-500 p-4 max-w-xs">
               <h3 className="text-green-400 text-xs font-bold uppercase tracking-widest mb-1">Current Sector</h3>
               <h1 className="text-white text-2xl font-bold uppercase">{batch.location}</h1>
               <p className="text-gray-400 text-xs mt-1 flex items-center gap-2">
                 <Globe size={12} /> Region: {regionCode}
               </p>
               <p className="text-gray-400 text-xs mt-1">
                 Dest: {batch.destination}
               </p>
            </div>

            {/* Satellite Status Header */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur p-2 rounded border border-gray-600 flex items-center gap-2">
              <Satellite className="text-green-500 animate-spin-slow" size={16} />
              <span className="text-green-500 font-mono text-xs">LIVE SATELLITE FEED • <span className="animate-pulse text-red-500">REC</span></span>
            </div>
          </div>
        </div>

        {/* RIGHT: SENSOR DATA PANEL */}
        <div className="w-full md:w-1/4 bg-gray-900 border-l border-gray-700 p-6 flex flex-col z-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wifi className="text-green-500 animate-pulse" /> Telemetry
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto">
            
            {/* Temperature Card */}
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 shadow-inner">
              <div className="flex items-center gap-3 mb-2">
                <Thermometer className="text-orange-500" />
                <span className="text-gray-400 text-xs uppercase font-bold">Internal Temp</span>
              </div>
              <div className="text-4xl font-mono text-white font-bold flex items-end gap-2">
                {temp}°C 
              </div>
              <div className="h-1 w-full bg-gray-700 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{width: `${(temp/40)*100}%`, transition: 'width 0.5s'}}></div>
              </div>
            </div>

            {/* Humidity Card */}
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 shadow-inner">
              <div className="flex items-center gap-3 mb-2">
                <Droplets className="text-blue-500" />
                <span className="text-gray-400 text-xs uppercase font-bold">Rel. Humidity</span>
              </div>
              <div className="text-4xl font-mono text-white font-bold">
                {humidity}%
              </div>
               <div className="h-1 w-full bg-gray-700 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{width: `${humidity}%`, transition: 'width 0.5s'}}></div>
              </div>
            </div>

            {/* Coordinates Card */}
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 shadow-inner">
              <div className="flex items-center gap-3 mb-2">
                <Navigation className="text-purple-500" />
                <span className="text-gray-400 text-xs uppercase font-bold">GPS Triangulation</span>
              </div>
              <div className="font-mono text-sm text-green-400 space-y-1 bg-black/40 p-3 rounded border border-green-500/20">
                <p className="flex justify-between"><span>LAT:</span> <span>{lat.toFixed(5)} N</span></p>
                <p className="flex justify-between"><span>LNG:</span> <span>{lng.toFixed(5)} E</span></p>
                <p className="flex justify-between text-gray-500"><span>ALT:</span> <span>1024 M</span></p>
              </div>
            </div>

            {/* Route Info */}
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
               <div className="flex items-center gap-3 mb-2">
                  <Map className="text-yellow-500" size={16} />
                  <span className="text-gray-400 text-xs uppercase font-bold">Route Status</span>
               </div>
               <div className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  On Schedule to {batch.destination}
               </div>
            </div>

          </div>

          <div className="mt-auto pt-6 border-t border-gray-800 text-center">
            <p className="text-[10px] text-gray-600 font-mono uppercase">
              AgriQCert IoT Network v2.4<br/>
              Secure Encrypted Stream
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default LiveTracker;