import { Color } from 'three';

export const THEME = {
  emerald: new Color('#003820'), // Deeper, richer emerald
  deepGreen: new Color('#001a0f'), // Almost black-green for depth
  gold: new Color('#FFC526'), // Bright magical gold
  roseGold: new Color('#E0BFB8'),
  white: new Color('#FFFFFF'),
  star: new Color('#FFF0AC'), // Pale gold for the star core
};

export const CONFIG = {
  foliageCount: 5000, // Increased density for a fuller look
  ornamentCount: 150,
  treeHeight: 13, // Slightly taller
  treeRadius: 5.5,
  scatterRadius: 18,
  transitionDuration: 2.8, // Slower, more majestic transition
};

// Animation weights: Higher value means faster response (lighter)
export const WEIGHTS = {
  HEAVY: 1.5,   // Boxes
  LIGHT: 3.0,   // Baubles
  ETHEREAL: 5.0 // Tiny particles
};