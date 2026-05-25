import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';

import Humanoid from './Humanoid';
import OrbitingTask from './OrbitingTask';
import BlackHole from './BlackHole';
import * as THREE from 'three';

function Particles({ warpMode }) {
  const count = 2000;
  const meshRef = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Warp speed effect
    if (warpMode) {
      meshRef.current.position.z += 2;
      meshRef.current.scale.z = 20;
      if (meshRef.current.position.z > 15) {
        meshRef.current.position.z = -15;
      }
    } else {
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, 0, 0.1);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, 1, 0.1);
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={warpMode ? 0.2 : 0.05}
        color="#22d3ee"
        transparent
        opacity={warpMode ? 0.8 : 0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function HolographicScan({ active }) {
  const scanRef = useRef();

  useFrame((state) => {
    if (!scanRef.current) return;
    if (active) {
      scanRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 3) * 2;
      scanRef.current.visible = true;
    } else {
      scanRef.current.visible = false;
    }
  });

  return (
    <mesh ref={scanRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <planeGeometry args={[5, 5]} />
      <meshBasicMaterial
        color="#22d3ee"
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function CinematicCamera() {
  const [introDone, setIntroDone] = useState(false);

  useFrame((state) => {
    if (!introDone) {
      // Zoom in from a far distance
      state.camera.position.lerp(new THREE.Vector3(0, 1.5, 8), 0.02);
      if (state.camera.position.z < 8.1) {
        setIntroDone(true);
      }
    }
  });

  return null;
}

function DynamicLights({ mood, theme }) {
  const lightRef = useRef();

  const targetColors = useMemo(() => {
    const baseColor = theme === 'cyber' ? '#FF007F' : theme === 'dream' ? '#D8B4E2' : '#22d3ee';
    return {
      idle: new THREE.Color(baseColor),
      thinking: new THREE.Color(theme === 'cyber' ? '#00F0FF' : '#a855f7'),
      alert: new THREE.Color('#f59e0b')
    };
  }, [theme]);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.color.lerp(targetColors[mood] || targetColors.idle, 0.05);
    }
  });

  return (
    <>
      <ambientLight intensity={theme === 'dream' ? 0.8 : 0.5} />
      <pointLight ref={lightRef} position={[2, 3, 2]} intensity={100} distance={20} />
      <pointLight position={[-2, -1, 2]} color={theme === 'cyber' ? '#00F0FF' : '#a855f7'} intensity={60} distance={20} />
      <pointLight position={[0, -3, -2]} color={theme === 'dream' ? '#FCEABB' : '#3b82f6'} intensity={80} distance={20} />
    </>
  );
}

export default function Scene({ gravityMode, warpMode, scanMode, triggerPulse, onCharacterClick, aiMood = 'idle', tasks = [], onDeleteTask, theme, chatOpen, messages, onSendMessage }) {
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  const fogColor = theme === 'cyber' ? '#0d0221' : theme === 'dream' ? '#1A1025' : '#0b0f1a';

  return (
    <Canvas camera={{ position: [0, 5, 20], fov: warpMode ? 75 : 45 }}>
      <CinematicCamera />
      <fog attach="fog" args={[fogColor, warpMode ? 0.05 : 0.02]} />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <DynamicLights mood={aiMood} theme={theme} />

      <Particles warpMode={warpMode} />

      <HolographicScan active={scanMode} />

      <Humanoid
        gravityMode={gravityMode}
        triggerPulse={triggerPulse}
        onClick={onCharacterClick}
        aiMood={aiMood}
        theme={theme}
      />

// Accretion disk and black hole rendering
      <BlackHole position={[4, -3, 0]} />

      {tasks.map((task, idx) => (
        <OrbitingTask
          key={task.id}
          task={task}
          index={idx}
          total={tasks.length}
          onDelete={onDeleteTask}
          onDragStateChange={(isDragging) => setOrbitEnabled(!isDragging)}
          gravityMode={gravityMode}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        maxDistance={15}
        minDistance={3}
        enabled={orbitEnabled}
        autoRotate={!warpMode && orbitEnabled}
        autoRotateSpeed={0.5}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}