import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, THEME } from '../constants';
import { TreeState } from '../types';
import { getRandomSpherePoint } from '../utils/math';

interface StarProps {
  state: TreeState;
}

const Star: React.FC<StarProps> = ({ state }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Calculate positions
  const scatterPos = useMemo(() => getRandomSpherePoint(CONFIG.scatterRadius), []);
  // Top of the tree position
  const treePos = useMemo(() => new THREE.Vector3(0, CONFIG.treeHeight / 2 + 0.8, 0), []);
  
  const currentPos = useRef(scatterPos.clone());

  // Generate Sharp 5-Point Star Shape
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.2;
    const innerRadius = 0.5;

    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      // Angle Calculation Adjustment:
      // previously -Math.PI/2 pointed down (6 o'clock).
      // +Math.PI/2 points up (12 o'clock).
      const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2; 
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center(); 
    return geom;
  }, []);
  
  useFrame((rootState, delta) => {
    if (!meshRef.current) return;
    
    const isTree = state === TreeState.TREE_SHAPE;
    const target = isTree ? treePos : scatterPos;
    
    const lerpSpeed = delta * 1.5;
    currentPos.current.lerp(target, lerpSpeed);
    
    meshRef.current.position.copy(currentPos.current);
    
    // Continuous rotation on Y
    meshRef.current.rotation.y += delta * 0.8;
    // Slight tilt wobble on Z
    meshRef.current.rotation.z = Math.sin(rootState.clock.elapsedTime * 2) * 0.1;
  });

  return (
    <group ref={meshRef}>
      {/* Core Star */}
      <mesh geometry={starGeometry}>
        <meshStandardMaterial 
          color={THEME.gold} 
          emissive={THEME.gold}
          emissiveIntensity={2.5} 
          roughness={0.1}
          metalness={1.0}
        />
      </mesh>
      
      {/* Light Source */}
      <pointLight 
        color="#fff0d0" 
        intensity={6} 
        distance={15} 
        decay={2} 
      />
    </group>
  );
};

export default Star;