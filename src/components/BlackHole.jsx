import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function BlackHole({ position }) {
  const ringRef = useRef();
  
  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.05;
      ringRef.current.rotation.x = Math.PI / 2.5; // Tilted slightly
    }
  });

  return (
    <group position={position}>
      {/* The Singularity (Black Sphere) */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Accretion Disk (Swirling Ring) */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.9, 1.8, 64]} />
        <meshBasicMaterial 
          color="#a855f7" 
          transparent 
          opacity={0.6} 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Event Horizon Glow */}
      <mesh>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.3} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
