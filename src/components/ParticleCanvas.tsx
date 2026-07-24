import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

// ── Tunable constants ──────────────────────────────────────────────
const CONFIG = {
  particleDensity: 0,               // Set to 0 to stop particles from spawning
  particleDensityFalloff: 0.75,     
  connectionDistance: 150,
  cursorConnectionMultiplier: 1.5,

  particleMinRadius: 1,
  particleMaxRadius: 3,
  particleMinOpacity: 0.5,
  particleMaxOpacity: 0.9,
  particleSpeed: 0,                 // Set to 0 to stop any movement

  lineWidth: 0.5,
  lineMaxOpacity: 0,                // Set to 0 to hide particle-to-particle lines
  cursorLineWidth: 2,
  cursorLineMaxOpacity: 0,          // Set to 0 to hide cursor lines

  glowEnabled: false,
  glowIntensity: 18,
  glowPulseDuration: 16,
  glowPulseGap: 0,
  glowSweepWidth: 0.12,
  glowPulseSpread: 0.15,
  glowPulseBrightness: 10,
};

interface Props {
  color?: string;
}

export default function ParticleCanvas({ color = "#6c63ff" }: Props) {
  // Turning it off entirely by returning null
  return null;
}