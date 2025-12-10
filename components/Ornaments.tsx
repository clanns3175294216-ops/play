import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateOrnamentData } from '../utils/math';
import { CONFIG, THEME, WEIGHTS } from '../constants';
import { TreeState } from '../types';

interface OrnamentGroupProps {
  state: TreeState;
  type: 'BOX' | 'SPHERE';
  count: number;
}

const OrnamentGroup: React.FC<OrnamentGroupProps> = ({ state, type, count }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => generateOrnamentData(count, type), [count, type]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Store current positions for smooth lerping
  const currentPositions = useRef(data.map(d => d.scatterPos.clone()));
  const currentRotations = useRef(data.map(d => d.rotation.clone()));

  useFrame((rootState, delta) => {
    if (!meshRef.current) return;

    const isTree = state === TreeState.TREE_SHAPE;
    const weight = type === 'BOX' ? WEIGHTS.HEAVY : WEIGHTS.LIGHT;
    
    // Adjust lerp factor based on weight - heavier items move slower
    const lerpFactor = delta * weight;

    data.forEach((item, i) => {
      const targetPos = isTree ? item.treePos : item.scatterPos;
      
      // Interpolate position
      currentPositions.current[i].lerp(targetPos, lerpFactor);
      
      // Add a slow rotation spin
      if (isTree) {
          currentRotations.current[i].x += delta * 0.2;
          currentRotations.current[i].y += delta * 0.2;
      }

      // Update dummy object
      dummy.position.copy(currentPositions.current[i]);
      dummy.rotation.set(
        currentRotations.current[i].x,
        currentRotations.current[i].y,
        currentRotations.current[i].z
      );
      dummy.scale.setScalar(item.scale);
      
      // Add subtle hover when in tree mode
      if (isTree) {
        dummy.position.y += Math.sin(rootState.clock.elapsedTime * 2 + i) * 0.02;
      }

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Assign colors
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const color = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      // Mix of Gold, Rose Gold, and Deep Red for boxes
      const seed = Math.random();
      if (seed > 0.6) color.set(THEME.gold);
      else if (seed > 0.3) color.set(THEME.roseGold);
      else color.set('#8B0000'); // Deep Red
      
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [count]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {type === 'BOX' ? <boxGeometry /> : <sphereGeometry args={[1, 32, 32]} />}
      <meshStandardMaterial 
        roughness={0.2} 
        metalness={0.9} 
        envMapIntensity={1.5}
      />
    </instancedMesh>
  );
};

const Ornaments: React.FC<{ state: TreeState }> = ({ state }) => {
  return (
    <group>
      {/* Heavy Gifts */}
      <OrnamentGroup state={state} type="BOX" count={40} />
      {/* Light Baubles */}
      <OrnamentGroup state={state} type="SPHERE" count={80} />
    </group>
  );
};

export default Ornaments;