import { Vector3, MathUtils } from 'three';
import { CONFIG } from '../constants';

/**
 * Generates a random point inside a sphere.
 */
export const getRandomSpherePoint = (radius: number): Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  
  return new Vector3(x, y, z);
};

/**
 * Generates a point on the volume of a cone (Christmas tree shape).
 */
export const getTreePoint = (height: number, maxRadius: number): Vector3 => {
  // y ranges from -height/2 to height/2
  const yRatio = Math.random(); 
  const y = (yRatio - 0.5) * height;
  
  // Radius at this height (linear taper)
  // At bottom (yRatio = 0), r = maxRadius. At top (yRatio = 1), r = 0.
  const rAtHeight = (1 - yRatio) * maxRadius;
  
  // Random position within the circle at this height
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * rAtHeight; // sqrt for uniform distribution
  
  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  
  return new Vector3(x, y, z);
};

/**
 * Generates initial data for foliage particles.
 */
export const generateFoliageData = (count: number) => {
  const positions = new Float32Array(count * 3);
  const targetPositions = new Float32Array(count * 3);
  const randoms = new Float32Array(count); // For individualized animation

  for (let i = 0; i < count; i++) {
    const scatter = getRandomSpherePoint(CONFIG.scatterRadius);
    const tree = getTreePoint(CONFIG.treeHeight, CONFIG.treeRadius);

    positions[i * 3] = scatter.x;
    positions[i * 3 + 1] = scatter.y;
    positions[i * 3 + 2] = scatter.z;

    targetPositions[i * 3] = tree.x;
    targetPositions[i * 3 + 1] = tree.y;
    targetPositions[i * 3 + 2] = tree.z;

    randoms[i] = Math.random();
  }

  return { positions, targetPositions, randoms };
};

/**
 * Generates initial data for ornaments.
 */
export const generateOrnamentData = (count: number, type: 'BOX' | 'SPHERE') => {
  const data = [];
  for (let i = 0; i < count; i++) {
    const scatter = getRandomSpherePoint(CONFIG.scatterRadius * 0.8);
    // Ornaments sit slightly outside the foliage usually
    const tree = getTreePoint(CONFIG.treeHeight, CONFIG.treeRadius + 0.5);
    
    data.push({
      scatterPos: scatter,
      treePos: tree,
      rotation: new Vector3(
        Math.random() * Math.PI, 
        Math.random() * Math.PI, 
        Math.random() * Math.PI
      ),
      scale: type === 'BOX' ? 0.3 + Math.random() * 0.4 : 0.2 + Math.random() * 0.3,
    });
  }
  return data;
};