import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS, TREE_CONFIG } from '../constants';

// --- Foliage Shader ---
const FoliageMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColorBase: { value: new THREE.Color(COLORS.emeraldDark) },
    uColorHighlight: { value: new THREE.Color(COLORS.goldHighlight) },
  },
  vertexShader: `
    uniform float uTime;
    attribute float size;
    attribute float random;
    varying vec3 vColor;
    varying float vAlpha;
    
    uniform vec3 uColorBase;
    uniform vec3 uColorHighlight;

    void main() {
      vec3 pos = position;
      
      // Wind/Breathing effect
      // Higher up (y) sways more
      float heightFactor = smoothstep(0.0, 10.0, pos.y);
      float sway = sin(uTime * 1.0 + pos.y * 0.5) * 0.1 * heightFactor;
      pos.x += sway;
      pos.z += cos(uTime * 0.8 + pos.x * 0.5) * 0.1 * heightFactor;

      // Breathing (expansion/contraction)
      pos += normal * sin(uTime * 2.0 + random * 10.0) * 0.03;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = size * (300.0 / -mvPosition.z);
      
      // Color mixing
      float mixFactor = random; 
      // Add a glow gradient from bottom to top
      vec3 finalColor = mix(uColorBase, uColorHighlight, mixFactor * 0.1 + heightFactor * 0.2);
      
      // Edge highlight logic simulation in vertex color for simplicity
      vColor = finalColor;
      vAlpha = 0.8 + 0.2 * sin(uTime * 3.0 + random * 100.0);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      // Circular particle with soft edge
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;
      
      // Glow intensity
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 2.0);
      
      gl_FragColor = vec4(vColor, vAlpha * strength);
    }
  `
};

// --- Data Generation ---

const generateFoliageData = (count: number) => {
  const positions = [];
  const sizes = [];
  const randoms = [];
  const height = TREE_CONFIG.height;
  const baseR = TREE_CONFIG.baseRadius;

  for (let i = 0; i < count; i++) {
    const y = Math.random() * height;
    // Linear cone shape
    const radiusAtY = baseR * (1 - y / height);
    // Volume distribution
    const r = Math.sqrt(Math.random()) * radiusAtY; 
    const theta = Math.random() * Math.PI * 2;
    
    positions.push(r * Math.cos(theta), y, r * Math.sin(theta));
    sizes.push(Math.random() * 0.5 + 0.3);
    randoms.push(Math.random());
  }
  
  return {
    positions: new Float32Array(positions),
    sizes: new Float32Array(sizes),
    randoms: new Float32Array(randoms)
  };
};

const generateOrnaments = (count: number, type: 'heavy' | 'light') => {
    const data = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 * goldenRatio;

    for (let i = 0; i < count; i++) {
        const t = i / count;
        // Avoid very top and very bottom
        const y = t * (TREE_CONFIG.height - 1.5) + 0.5; 
        const radiusAtY = TREE_CONFIG.baseRadius * (1 - y / TREE_CONFIG.height);
        
        // Place on surface
        const r = radiusAtY * 0.85 + (Math.random() * 0.2); 
        const theta = angleIncrement * i;
        
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);

        const scale = type === 'heavy' 
            ? Math.random() * 0.3 + 0.25 
            : Math.random() * 0.2 + 0.15;

        // "Heavy" items might hang lower or be oriented differently? 
        // For now just random rotation
        const rotation = new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0);

        data.push({ pos: new THREE.Vector3(x, y, z), scale, rotation });
    }
    return data;
};

export const Tree: React.FC = () => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  const foliage = useMemo(() => generateFoliageData(4000), []);
  const gifts = useMemo(() => generateOrnaments(25, 'heavy'), []); // Heavy gifts
  const baubles = useMemo(() => generateOrnaments(50, 'light'), []); // Light baubles

  // Generate Star Shape
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 5;
    const outerRadius = 0.8;
    const innerRadius = 0.38;

    shape.moveTo(0, outerRadius);
    for (let i = 1; i < sides * 2; i++) {
        const angle = (i * Math.PI) / sides;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        shape.lineTo(Math.sin(angle) * r, Math.cos(angle) * r);
    }
    shape.closePath();
    return shape;
  }, []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group position={[0, -3, 0]}>
      
      {/* 1. FOLIAGE LAYER */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={foliage.positions.length / 3}
            array={foliage.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={foliage.sizes.length}
            array={foliage.sizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-random"
            count={foliage.randoms.length}
            array={foliage.randoms}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={shaderRef}
          args={[FoliageMaterial]}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Dark inner core to block transparency */}
      <mesh position={[0, TREE_CONFIG.height/2, 0]}>
        <coneGeometry args={[TREE_CONFIG.baseRadius * 0.5, TREE_CONFIG.height, 16]} />
        <meshBasicMaterial color="#001005" />
      </mesh>

      {/* 2. ORNAMENT SYSTEM */}
      
      {/* Heavy Elements: Gifts */}
      <Instances range={gifts.length}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            color="#8b0000" 
            roughness={0.2} 
            metalness={0.4}
        />
        {gifts.map((d, i) => (
            <Instance 
                key={i} 
                position={d.pos} 
                scale={d.scale} 
                rotation={d.rotation} 
                color={Math.random() > 0.5 ? '#8b0000' : '#003311'} // Red or Dark Green gifts
            />
        ))}
      </Instances>

      {/* Light Elements: Baubles */}
      <Instances range={baubles.length}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            color={COLORS.gold} 
            roughness={0.0} 
            metalness={1.0} 
            envMapIntensity={2.5}
        />
        {baubles.map((d, i) => (
            <Instance 
                key={i} 
                position={d.pos} 
                scale={d.scale} 
                color={Math.random() > 0.7 ? COLORS.goldWarm : COLORS.gold}
            />
        ))}
      </Instances>

      {/* Very Light Elements: Tiny Stars/Lights */}
      <Sparkles 
        count={200} 
        scale={[TREE_CONFIG.baseRadius * 2, TREE_CONFIG.height, TREE_CONFIG.baseRadius * 2]} 
        position={[0, TREE_CONFIG.height/2, 0]}
        size={4} 
        speed={0.2} 
        opacity={0.8}
        color="#fffee0"
      />

      {/* Topper: Yellow Five-pointed Star */}
      <Float floatIntensity={1} rotationIntensity={1} speed={2}>
        <group position={[0, TREE_CONFIG.height + 0.6, 0]}>
             {/* Center the extrusion (approx 0.2 depth means center is -0.1) */}
             <mesh position={[0, 0, -0.2]}> 
                 <extrudeGeometry 
                    args={[
                        starShape, 
                        { 
                            depth: 0.4, 
                            bevelEnabled: true, 
                            bevelThickness: 0.1, 
                            bevelSize: 0.05, 
                            bevelSegments: 4 
                        }
                    ]} 
                 />
                 <meshStandardMaterial 
                    color="#FFD700" 
                    emissive="#FFCC00" 
                    emissiveIntensity={3} 
                    toneMapped={false} 
                    roughness={0.1}
                    metalness={1.0}
                 />
             </mesh>
             {/* Glow halo */}
             <pointLight intensity={3} color="#FFD700" distance={8} decay={2} />
        </group>
      </Float>

      {/* Base */}
      <mesh position={[0, 0, 0]}>
         <cylinderGeometry args={[0.5, 0.8, 1, 16]} />
         <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>

    </group>
  );
};