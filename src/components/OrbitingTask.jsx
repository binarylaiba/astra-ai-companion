import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, DragControls } from '@react-three/drei';
import * as THREE from 'three';

export default function OrbitingTask({ task, index, total, onDelete, onDragStateChange, gravityMode }) {
  const groupRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const { camera } = useThree();
  
  const startAngle = (index / total) * Math.PI * 2;
  const radius = 2.5; 
  const speed = 0.5;

  useFrame((state) => {
    if (!groupRef.current) return;
    
    if (!isDragging) {
      if (gravityMode) {
        // Fall down to the floor
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -2.8, 0.05);
      } else {
        const t = state.clock.getElapsedTime();
        const currentAngle = startAngle + (t * speed);
        
        // Return to orbit
        const targetX = Math.cos(currentAngle) * radius;
        const targetZ = Math.sin(currentAngle) * radius;
        const targetY = Math.sin(t * 2 + index) * 0.2 + 0.5;

        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
      }
    }
    
    groupRef.current.lookAt(camera.position);
  });

  const handleDragStart = () => {
    setIsDragging(true);
    if (onDragStateChange) onDragStateChange(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (onDragStateChange) onDragStateChange(false);
    
    // Check distance to black hole (positioned at [4, -3, 0])
    const blackHolePos = new THREE.Vector3(4, -3, 0);
    // Use world position to avoid nested group matrix issues
    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);
    
    if (worldPos.distanceTo(blackHolePos) < 2.5) {
      if (onDelete) onDelete(task.id);
    }
  };

  return (
    <DragControls onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <group ref={groupRef}>
        {/* Project Tag Label */}
        {task.project && task.project.toLowerCase() !== 'general' && (
          <Text
            position={[0, 0.22, 0]}
            color={isDragging ? "#ef4444" : (task.color || "#F59E0B")}
            fontSize={0.12}
            maxWidth={2}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.05}
          >
            {`[${task.project.toUpperCase()}]`}
          </Text>
        )}

        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            color={isDragging ? "#ef4444" : (task.color || "#F59E0B")} 
            emissive={isDragging ? "#ef4444" : (task.color || "#F59E0B")}
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
        
        <Text
          color={isDragging ? "#ef4444" : "#ffffff"}
          fontSize={0.2}
          maxWidth={2}
          lineHeight={1}
          letterSpacing={0.02}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
        >
          {task.text}
        </Text>
      </group>
    </DragControls>
  );
}
