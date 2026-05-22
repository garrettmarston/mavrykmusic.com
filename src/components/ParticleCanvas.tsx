import React, { useEffect, useRef } from "react";

interface ParticleCanvasProps {
  color?: string;
}

export default function ParticleCanvas({ color = "#ffffff" }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const PARTICLE_COUNT = 75;      
    const CONNECTION_DIST = 120;    
    const BASE_SPEED = 0.35;         

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseRadius: number;
      pulseSpeed: number;
      pulsePhase: number;
    }

    // 🔥 Shockwave ripple tracking state
    let rippleX = 0;
    let rippleY = 0;
    let rippleRadius = 0;
    const RIPPLE_MAX_SPEED = 8;
    const RIPPLE_MAX_RADIUS = 250;

    const particles: Particle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * BASE_SPEED,
        vy: (Math.random() - 0.5) * BASE_SPEED,
        baseRadius: Math.random() * 1.5 + 1.25,
        pulseSpeed: 0.02 + Math.random() * 0.03, // Shifting rate for individual throbbing
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    function draw() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      // 🌊 Expand click shockwave ripple automatically over time
      if (rippleRadius > 0) {
        rippleRadius += RIPPLE_MAX_SPEED;
        if (rippleRadius > RIPPLE_MAX_RADIUS) {
          rippleRadius = 0; // Reset when it finishes expanding
        }
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];

        // Core drifting math
        p.x += p.vx;
        p.y += p.vy;

        // Shockwave displacement calculations
        if (rippleRadius > 0) {
          const dxRipple = p.x - rippleX;
          const dyRipple = p.y - rippleY;
          const distRipple = Math.sqrt(dxRipple * dxRipple + dyRipple * dyRipple);
          
          // If the shockwave ring hits a node, push it out slightly along the wave angle
          if (Math.abs(distRipple - rippleRadius) < 15) {
            const force = (1 - distRipple / RIPPLE_MAX_RADIUS) * 3;
            const angle = Math.atan2(dyRipple, dxRipple);
            p.x += Math.cos(angle) * force;
            p.y += Math.sin(angle) * force;
          }
        }

        // Clean bounce boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // ✨ PULSING GLOW MATH: Updates individual star size pulsing via sine wave cycles
        p.pulsePhase += p.pulseSpeed;
        const currentRadius = p.baseRadius + Math.sin(p.pulsePhase) * 0.6;

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + Math.sin(p.pulsePhase) * 0.25})`; 
        ctx.fill();

        // Check node connections
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            let alpha = (1 - dist / CONNECTION_DIST) * 0.4;

            // 🔥 SEAMLESS BRIGHTENING: If the line falls inside the ripple radius zone, light it up!
            if (rippleRadius > 0) {
              const dxMid = (p.x + p2.x) / 2 - rippleX;
              const dyMid = (p.y + p2.y) / 2 - rippleY;
              const distMid = Math.sqrt(dxMid * dxMid + dyMid * dyMid);
              
              if (Math.abs(distMid - rippleRadius) < 40) {
                alpha *= 2.2; // Flash the line brighter as the wave rolls past
              }
            }

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(alpha, 0.95)})`;
            ctx.lineWidth = rippleRadius > 0 ? 1.15 : 0.85;
            ctx.stroke();
          }
        }
      }

      ctx.globalCompositeOperation = "source-over";
      animationFrameId = requestAnimationFrame(draw);
    }

    // 💥 Listen for mouse clicks or mobile screen taps anywhere on the section
    function handleWindowClick(e: MouseEvent) {
      rippleX = e.clientX;
      rippleY = e.clientY;
      rippleRadius = 1; // Spawns the wave ring engine
    }

    function handleWindowTouch(e: TouchEvent) {
      if (e.touches.length === 0) return;
      rippleX = e.touches[0].clientX;
      rippleY = e.touches[0].clientY;
      rippleRadius = 1;
    }

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("click", handleWindowClick);
    window.addEventListener("touchstart", handleWindowTouch);

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleWindowClick);
      window.removeEventListener("touchstart", handleWindowTouch);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}