import { Vector3 } from 'three';

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  scatterPos: Vector3;
  treePos: Vector3;
  color: string;
  size: number;
  speed: number; // For breathing/twinkle animation speed
}

export interface OrnamentData {
  id: number;
  scatterPos: Vector3;
  treePos: Vector3;
  rotation: Vector3;
  scale: number;
  type: 'HEAVY' | 'LIGHT' | 'ETHEREAL'; // Determines animation lag/weight
  color: string;
}

// Shader Uniform types
export type FoliageUniforms = {
  uTime: { value: number };
  uProgress: { value: number }; // 0 = Scattered, 1 = Tree
  uColorPrimary: { value: Vector3 };
  uColorSecondary: { value: Vector3 };
};