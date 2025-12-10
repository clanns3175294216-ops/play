import React from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Star from './Star';
import { TreeState } from '../types';
import { THEME, CONFIG } from '../constants';

interface SceneProps {
  treeState: TreeState;
}

const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <>
      <color attach="background" args={['#000502']} />
      
      <OrbitControls 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.6}
        minDistance={15}
        maxDistance={50}
        enablePan={false}
        dampingFactor={0.05}
        target={[0, 0, 0]} 
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} color={THEME.deepGreen} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffeebb" />
      <pointLight position={[-10, 0, -10]} intensity={1} color={THEME.emerald} />
      <spotLight 
        position={[0, 25, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={3} 
        castShadow 
        color="#fffae6"
      />

      {/* Environment Map */}
      <Environment preset="city" blur={0.6} />

      {/* 
        Positioning Update:
        Moving from -1.0 to 1.0 to raise the tree significantly higher.
        This ensures the bulk of the tree and the star are centrally framed.
      */}
      <group position={[0, 1.0, 0]}>
        <Foliage state={treeState} />
        <Ornaments state={treeState} />
        <Star state={treeState} />
        <ContactShadows position={[0, -CONFIG.treeHeight/2, 0]} opacity={0.6} scale={30} blur={3} far={10} color="#000000" />
      </group>
      
      {/* Background Stars */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.6} 
          luminanceSmoothing={0.9} 
          intensity={1.2} 
          mipmapBlur 
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </>
  );
};

export default Scene;