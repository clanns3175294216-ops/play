import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { generateFoliageData } from '../utils/math';
import { CONFIG, THEME } from '../constants';
import { TreeState } from '../types';

// Vertex Shader
const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform float uPixelRatio;
  
  attribute vec3 aTargetPos;
  attribute float aRandom;
  
  varying float vAlpha;
  varying float vRandom;
  varying vec3 vPos;

  float easeOutCubic(float x) {
    return 1.0 - pow(1.0 - x, 3.0);
  }

  void main() {
    vRandom = aRandom;
    
    float t = easeOutCubic(uProgress);
    vec3 pos = mix(position, aTargetPos, t);
    
    // Breathing animation
    float breath = sin(uTime * 1.5 + aRandom * 10.0) * 0.08 * t;
    pos += normalize(pos) * breath;
    vPos = pos;
    
    // Size calculation
    float sizeMod = 0.8 + sin(uTime * 2.0 + aRandom * 100.0) * 0.2;
    float baseSize = 25.0 * sizeMod;
    
    // Sparkle particles slightly smaller to look like sharp points of light
    if (aRandom > 0.90) { // Changed threshold to include more particles
       baseSize *= 0.7; 
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    gl_PointSize = baseSize * uPixelRatio * (20.0 / -mvPosition.z);
    
    // Solid opacity when aggregated
    vAlpha = 0.8 + 0.2 * t;
  }
`;

// Fragment Shader
const fragmentShader = `
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  uniform vec3 uColorSparkle;
  uniform float uTime;
  
  varying float vAlpha;
  varying float vRandom;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    if (dist > 0.5) discard;
    
    float strength = 1.0 - smoothstep(0.3, 0.5, dist);
    
    vec3 finalColor;
    
    // SPARKLE LOGIC:
    // Increased frequency (matching vertex shader logic if possible, or using uniform logic)
    // Here we assume vRandom passed from vertex is sufficient
    if (vRandom > 0.90) { // Top 10% are sparkles (was 5%)
        // Rapid twinkling
        float flash = sin(uTime * 8.0 + vRandom * 50.0) * 0.5 + 0.5;
        // Mix between pure gold and hot white
        finalColor = mix(uColorSparkle, vec3(1.5), flash); // 1.5 for HDR brightness
        
        // Make the core very hot for Bloom
        strength = pow(strength, 0.5) * 2.0; 
    } else {
        // Normal Green Foliage
        finalColor = mix(uColorPrimary, uColorSecondary, vRandom * 0.6);
        
        // Subtle rim light
        if (vRandom > 0.8 && vRandom <= 0.90) {
             finalColor += vec3(0.05, 0.1, 0.05);
        }
    }

    gl_FragColor = vec4(finalColor, vAlpha * strength);
  }
`;

interface FoliageProps {
  state: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ state }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  const { positions, targetPositions, randoms } = useMemo(
    () => generateFoliageData(CONFIG.foliageCount), 
    []
  );

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uColorPrimary: { value: THEME.deepGreen }, 
    uColorSecondary: { value: THEME.emerald },
    uColorSparkle: { value: new THREE.Color('#FFD700') }, // Pure Gold
  }), []);

  useFrame((rootState, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = rootState.clock.elapsedTime;
      
      const target = state === TreeState.TREE_SHAPE ? 1.0 : 0.0;
      const current = shaderRef.current.uniforms.uProgress.value;
      const lerpSpeed = delta * (1.0 / (CONFIG.transitionDuration * 0.5)); 
      
      if (Math.abs(target - current) > 0.001) {
        shaderRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(current, target, lerpSpeed);
      } else {
         shaderRef.current.uniforms.uProgress.value = target;
      }
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPos"
          count={targetPositions.length / 3}
          array={targetPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        transparent={true}
        depthWrite={false} 
        blending={THREE.NormalBlending}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </points>
  );
};

export default Foliage;