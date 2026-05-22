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

    let centerX = width / 2;
    let centerY = height / 2;

    const STAR_COUNT = 150;  
    const SPEED = 4.5;       

    interface Star {
      x: number;
      y: number;
      z: number;
      prevZ: number;
      hue: number;           
    }

    const stars: Star[] = [];

    function initStar(star: Partial<Star> = {}): Star {
      return {
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * width,
        prevZ: 0,
        hue: 195 + Math.random() * 35, // Shifting neon ice blues & cyans
        ...star,
      };
    }

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(initStar());
    }

    function draw() {
      if (!ctx || !canvas) return;

      // 🔥 FIXED: Clear only the canvas transparent pixels, keeping the background image completely intact
      ctx.clearRect(0, 0, width, height);

      // Turn on overlay glow blending so stars light up beautifully
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < STAR_COUNT; i++) {
        const star = stars[i];

        // Save last positions to calculate the length of the warp line
        star.prevZ = star.z;
        star.z -= SPEED;

        if (star.z <= 0) {
          stars[i] = initStar({ z: width });
          continue;
        }

        const sx = (star.x / star.z) * (width * 0.6) + centerX;
        const sy = (star.y / star.z) * (width * 0.6) + centerY;

        // 🔥 THE TAIL FIX: By scaling the previous Z calculation backwards, the line naturally 
        // stretches into a permanent motion trail without needing to paint a background box over your image!
        const trailStretch = star.prevZ + (SPEED * 2.5);
        const px = (star.x / trailStretch) * (width * 0.6) + centerX;
        const py = (star.y / trailStretch) * (width * 0.6) + centerY;

        if (sx < 0 || sx > width || sy < 0 || sy > height) {
          continue;
        }

        const alpha = Math.min(1 - star.z / width, 1);

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);

        // Vibrant neon glow colors
        ctx.strokeStyle = `hsla(${star.hue}, 95%, ${Math.min(50 + alpha * 50, 100)}%, ${alpha * 0.8})`;
        ctx.lineWidth = Math.max(0.75, (1 - star.z / width) * 3.5); 
        ctx.lineCap = "round";
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
      animationFrameId = requestAnimationFrame(draw);
    }

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      centerX = width / 2;
      centerY = height / 2;
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