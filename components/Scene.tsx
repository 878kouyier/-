import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, BakeShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Tree } from './Tree';
import { COLORS } from '../constants';

interface SceneProps {
  autoRotate: boolean;
  bloomIntensity: number;
}

export const Scene: React.FC<SceneProps> = ({ autoRotate, bloomIntensity }) => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 2, 12], fov: 45 }}
      gl={{ antialias: false, toneMappingExposure: 1.2 }}
      className="w-full h-full bg-[#050505]"
    >
      <Suspense fallback={null}>
        {/* Environment - Studio style for reflections */}
        <Environment preset="city" />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} color={COLORS.emeraldDark} />
        
        {/* Main Key Light */}
        <spotLight 
          position={[10, 15, 10]} 
          angle={0.3} 
          penumbra={0.5} 
          intensity={2} 
          castShadow 
          shadow-bias={-0.0001}
          color={COLORS.goldHighlight}
        />
        
        {/* Fill Light (Cooler) */}
        <pointLight position={[-10, 5, -10]} intensity={1} color="#204040" />

        {/* Back Light (Rim) */}
        <spotLight position={[0, 10, -10]} intensity={3} color={COLORS.gold} />

        {/* The Star of the Show */}
        <Tree />

        {/* Shadows on floor */}
        <ContactShadows 
          resolution={1024} 
          scale={20} 
          blur={2} 
          opacity={0.5} 
          far={10} 
          color="#000000" 
        />

        {/* Controls */}
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
        />

        {/* Post Processing */}
        <EffectComposer disableNormalPass>
            <Bloom 
                luminanceThreshold={0.8} 
                mipmapBlur 
                intensity={bloomIntensity} 
                radius={0.7} 
            />
            <Vignette eskil={false} offset={0.1} darkness={0.8} />
            <Noise opacity={0.02} />
        </EffectComposer>
        
        <BakeShadows />
      </Suspense>
    </Canvas>
  );
};
