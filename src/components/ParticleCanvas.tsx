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

    // Network configuration settings
    const PARTICLE_COUNT = 75;      // Balanced count prevents the screen from looking cluttered
    const CONNECTION_DIST = 110;    // Maximum distance (in pixels) where a line will snap together
    const BASE_SPEED = 0.4;         // Soft, atmospheric movement speed

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      hue: number;
    }

    const particles: Particle[] = [];

    // Spawn network points randomly across the screen space
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * BASE_SPEED,
        vy: (Math.random() - 0.5) * BASE_SPEED,
        radius: Math.random() * 1.5 + 1, // Tiny clean dots
        hue: 195 + Math.random() * 30,    // Sleek cyber cyans and ice blues
      });
    }

    function draw() {
      if (!ctx || !canvas) return;

      // Keep your cloud background completely transparent and crisp
      ctx.clearRect(0, 0, width, height);
      
      // Use clean additive lighting for the network joints
      ctx.globalCompositeOperation = "lighter";

      // Update positions and draw individual nodes
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Perfect bounce boundaries so points never drift off screen
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Render the point node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, 0.6)`;
        ctx.fill();

        // NESTED DISTANCE CHECK: Calculate space between this point and every other point
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // If they are close enough, weave a connecting web strand
          if (dist < CONNECTION_DIST) {
            // Fade the line opacity out smoothly as nodes drift further apart
            const alpha = (1 - dist / CONNECTION_DIST) * 0.25;

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            // Uses a gradient blending shade between the two nodes
            ctx.strokeStyle = `hsla(${p.hue}, 85%, 70%, ${alpha})`;
            ctx.lineWidth = 0.75;
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
      
      // Re-map out-of-bounds nodes on screen resize
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