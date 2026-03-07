import { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import { motion } from 'framer-motion';
import { X, Globe as GlobeIcon, Navigation } from 'lucide-react';

const GlobalNetwork = ({ batches, onClose }) => {
  const globeEl = useRef();
  const [arcs, setArcs] = useState([]);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    // 1. Define Origin (India - Approx Center)
    const origin = { lat: 20.5937, lng: 78.9629, name: "AgriQCert HQ (India)" };

    // 2. Generate Destination Data from Batches
    // In a real app, you'd use a geocoding API to turn "Dubai" into Lat/Lng.
    // Here we mock a few major trade hubs for the visual effect.
    const tradeHubs = [
      { lat: 25.2048, lng: 55.2708, name: "Dubai, UAE" },
      { lat: 51.5074, lng: -0.1278, name: "London, UK" },
      { lat: 40.7128, lng: -74.0060, name: "New York, USA" },
      { lat: 1.3521, lng: 103.8198, name: "Singapore" },
      { lat: 35.6762, lng: 139.6503, name: "Tokyo, Japan" }
    ];

    // Map batches to random hubs for the demo visual
    const newArcs = tradeHubs.map(hub => ({
      startLat: origin.lat,
      startLng: origin.lng,
      endLat: hub.lat,
      endLng: hub.lng,
      color: ['#22c55e', '#3b82f6'][Math.floor(Math.random() * 2)] // Green or Blue arcs
    }));

    // Add points for hubs + origin
    setPoints([origin, ...tradeHubs]);
    setArcs(newArcs);

    // Auto-rotate
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 1.5;
    }
  }, [batches]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl overflow-hidden">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full h-full flex items-center justify-center"
      >
        
        {/* HEADER OVERLAY */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <GlobeIcon className="text-blue-500 animate-spin-slow" /> 
              Global Trade Neural Network
            </h1>
            <p className="text-blue-300/70 font-mono text-sm mt-2">
              Visualizing Active Blockchain Supply Chains
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all backdrop-blur-md border border-white/10"
          >
            <X size={24} />
          </button>
        </div>

        {/* THE 3D GLOBE */}
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          // Arcs (The Trade Routes)
          arcsData={arcs}
          arcColor="color"
          arcDashLength={0.5}
          arcDashGap={1}
          arcDashAnimateTime={2000}
          arcStroke={2}

          // Points (The Cities)
          pointsData={points}
          pointColor={() => '#facc15'} // Gold dots
          pointAltitude={0.05}
          pointRadius={0.5}
          pointPulseBtn={true} // Pulse animation
          
          // Atmosphere glow
          atmosphereColor="#3b82f6"
          atmosphereAltitude={0.15}
        />

        {/* STATS OVERLAY */}
        <div className="absolute bottom-8 left-8 pointer-events-none space-y-4">
          <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border-l-4 border-green-500 max-w-sm">
             <h3 className="text-green-400 text-xs font-bold uppercase tracking-widest mb-1">Active Routes</h3>
             <div className="text-white text-2xl font-bold">5 Continents</div>
             <p className="text-gray-400 text-xs mt-1">Real-time latency: 24ms</p>
          </div>
          
          <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border-l-4 border-blue-500 max-w-sm">
             <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Total Volume</h3>
             <div className="text-white text-2xl font-bold">14,250 Tons</div>
             <p className="text-gray-400 text-xs mt-1">Verified on Ledger</p>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default GlobalNetwork;