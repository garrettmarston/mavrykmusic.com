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
    const CONNECTION_DIST = 110;    
    const BASE_SPEED = 0.4;         

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }

    const particles: Particle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * BASE_SPEED,
        vy: (Math.random() - 0.5) * BASE_SPEED,
        radius: Math.random() * 1.75 + 1.25, // 📐 Slightly larger nodes for high visibility
      });
    }

    function draw() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, width, height);
      
      // Hardware-accelerated additive blending makes overlapping white lines turn ultra-bright
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Render the point node as crisp, bright white
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)"; // 🔥 Solid bright white nodes
        ctx.fill();

        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            // Increased the baseline transparency scale so the web lines stay very clear
            const alpha = (1 - dist / CONNECTION_DIST) * 0.45;

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`; // 🔥 Solid bright white lines
            ctx.lineWidth = 1.0; // Slightly thicker lines for visibility
            ctx.stroke();
          }
        }
      }

      ctx.globalCompositeOperation = "source-over";
      animationFrameId = requestAnimationFrame(draw);
    }

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      particles.forEach((p) => {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
      });
    }

    window.addEventListener("resize", handleResize);
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}