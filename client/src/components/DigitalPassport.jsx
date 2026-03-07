import { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { CheckCircle, ShieldCheck, Globe, Calendar, ArrowLeft, X, ExternalLink, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

const DigitalPassport = ({ batch, inspection, onClose }) => {
  const passportRef = useRef(null); // Reference to the card for downloading
  const verificationURL = `http://localhost:5173/verify/${batch._id}`;

  useEffect(() => {
    // Trigger Confetti on Open
    const end = Date.now() + 1000;
    const colors = ['#16a34a', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  const handleDownload = async () => {
    if (!passportRef.current) return;
    
    // Capture the element
    const canvas = await html2canvas(passportRef.current, {
      backgroundColor: "#f3f4f6", // Ensure background isn't transparent
      scale: 2 // High resolution
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `AgriQCert-${batch.productType}-${batch._id.substring(0,6)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-gray-100 w-full max-w-3xl shadow-2xl rounded-xl overflow-hidden"
      >
        
        {/* NAVIGATION HEADER */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-20">
          <button 
            onClick={onClose} 
            className="flex items-center gap-2 text-gray-600 hover:text-black font-bold transition-colors"
          >
            <ArrowLeft size={20} /> Back
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl"
            >
              <Download size={18} /> Download File
            </button>
            <button 
              onClick={onClose} 
              className="p-2 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CERTIFICATE CONTENT (Wrapped in Ref for Screenshot) */}
        <div className="p-6 md:p-8" ref={passportRef}>
          <div className="border-4 border-double border-gray-300 p-8 rounded-lg bg-white bg-[radial-gradient(#f3f4f6_1px,transparent_1px)] [background-size:16px_16px]">
            
            {/* HEADER */}
            <div className="text-center border-b-2 border-gray-100 pb-6 mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <ShieldCheck size={40} className="text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-wide uppercase">Digital Product Passport</h1>
              <p className="text-green-600 font-medium mt-2 tracking-widest uppercase text-sm">Verified Agricultural Produce</p>
            </div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* LEFT: Product Details */}
              <div className="col-span-2 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Information</h3>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Commodity</p>
                        <p className="text-xl font-bold text-gray-900">{batch.productType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Quantity</p>
                        <p className="text-lg font-semibold">{batch.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Origin</p>
                        <div className="flex items-center gap-1">
                          <Globe size={14} className="text-gray-400"/>
                          <p className="font-medium">{batch.location}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Batch ID</p>
                        <p className="font-mono text-xs bg-gray-200 inline-block px-2 py-1 rounded">{batch._id.substring(0, 12)}...</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quality Analysis Results</h3>
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <p className="text-sm text-blue-500">Moisture Level</p>
                        <p className="font-bold text-gray-800">{inspection?.moisture || '12% (Standard)'}</p>
                       </div>
                       <div>
                        <p className="text-sm text-blue-500">Pesticide</p>
                        <p className="font-bold text-gray-800">{inspection?.pesticide || 'Pass (<0.01)'}</p>
                       </div>
                       <div className="col-span-2 pt-2 border-t border-blue-100">
                        <p className="text-sm text-blue-500">Compliance Standard</p>
                        <p className="font-mono text-sm text-gray-800">{inspection?.isoCode || 'ISO-22000:2018'}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: QR & Verification */}
              <div className="flex flex-col items-center justify-center p-6 bg-gray-900 text-white rounded-xl text-center">
                <div className="bg-white p-3 rounded-lg shadow-lg mb-4">
                  <QRCodeSVG value={verificationURL} size={120} />
                </div>
                
                <a 
                  href={verificationURL} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline text-sm mb-2 flex items-center gap-1 font-bold animate-pulse"
                >
                  <ExternalLink size={14} /> Click to Verify
                </a>

                <p className="text-xs text-gray-400 mb-4">or Scan with Camera</p>
                
                <div className="w-full bg-white/10 p-3 rounded-lg mb-2">
                  <p className="text-xs text-gray-400">Issuer DID</p>
                  <p className="text-[10px] font-mono text-green-400 break-all">did:web:agriqcert:qa-01</p>
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-green-400 font-bold text-sm">
                  <CheckCircle size={16} /> Securely Signed
                </div>
              </div>

            </div>

            {/* FOOTER */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-400">Issued Date</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar size={14} /> {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="h-10 w-32 border-b-2 border-gray-800 mb-1"></div>
                <p className="text-xs text-gray-500 uppercase">Authorized Signature</p>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DigitalPassport;