import React from 'react';
import { Zap, Play, Pause } from 'lucide-react';

interface OverlayProps {
  onToggleRotate: () => void;
  isRotating: boolean;
  onToggleGlow: () => void;
  isHighGlow: boolean;
}

export const Overlay: React.FC<OverlayProps> = ({ 
  onToggleRotate, 
  isRotating,
  onToggleGlow,
  isHighGlow
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10 text-[#d4af37]">
      
      {/* Header */}
      <header className="flex flex-col items-center md:items-start space-y-2 fade-in mt-8 md:mt-0">
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFF] to-[#d4af37] drop-shadow-sm text-center md:text-left leading-tight">
          A very Merry <br/> <span className="text-5xl md:text-7xl italic font-light">Christmas</span>
        </h1>
        <h2 className="text-lg md:text-2xl font-serif tracking-[0.1em] text-[#d4af37]/90 italic mt-2">
          And a happy new year
        </h2>
      </header>

      {/* Controls Container */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 md:mb-0">
        
        {/* Description / To field */}
        <div className="max-w-md">
           <p className="font-serif italic text-3xl md:text-4xl opacity-90 leading-relaxed text-[#fffacd] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            to huang
          </p>
        </div>

        {/* Interactive Buttons */}
        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={onToggleRotate}
            className="group flex items-center justify-center gap-3 px-6 py-3 border border-[#d4af37]/30 bg-[#001a0f]/80 backdrop-blur-md rounded-full hover:bg-[#d4af37] hover:text-[#002a15] transition-all duration-500 ease-out"
          >
            {isRotating ? <Pause size={18} /> : <Play size={18} />}
            <span className="text-xs uppercase tracking-widest font-bold">
              {isRotating ? 'Pause' : 'Rotate'}
            </span>
          </button>

          <button 
            onClick={onToggleGlow}
            className={`group flex items-center justify-center gap-3 px-6 py-3 border rounded-full backdrop-blur-md transition-all duration-500 ease-out ${
                isHighGlow 
                ? 'bg-[#d4af37] text-[#002a15] border-[#d4af37]' 
                : 'border-[#d4af37]/30 bg-[#001a0f]/80 text-[#d4af37] hover:border-[#d4af37]'
            }`}
          >
            <Zap size={18} className={isHighGlow ? 'fill-current' : ''} />
            <span className="text-xs uppercase tracking-widest font-bold">
              Radiance
            </span>
          </button>
        </div>
      </div>

      {/* Decorative footer line */}
      <div className="absolute bottom-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent pointer-events-none md:block hidden"></div>
    </div>
  );
};
