import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';

export default function App() {
  const [isRotating, setIsRotating] = useState(true);
  const [isHighGlow, setIsHighGlow] = useState(true);

  return (
    <div className="relative w-full h-screen bg-[#020403] overflow-hidden">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene 
          autoRotate={isRotating} 
          bloomIntensity={isHighGlow ? 1.5 : 0.5} 
        />
      </div>

      {/* UI Overlay Layer */}
      <Overlay 
        isRotating={isRotating} 
        onToggleRotate={() => setIsRotating(!isRotating)}
        isHighGlow={isHighGlow}
        onToggleGlow={() => setIsHighGlow(!isHighGlow)}
      />
      
      {/* Texture Overlay for Film Grain feel (CSS only) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-20" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  );
}