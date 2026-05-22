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

    // 🔥 Tweak these parameters to dial in the look
    const STAR_COUNT = 150;  // Slightly fewer stars makes individual long streaks more distinct
    const SPEED = 4.5;        // Faster speed creates longer, more dramatic warp streaks

    interface Star {
      x: number;
      y: number;
      z: number;
      prevZ: number;
      hue: number;           // Individual star color trait
    }

    const stars: Star[] = [];

    function initStar(star: Partial<Star> = {}): Star {
      return {
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * width,
        prevZ: 0,
        // 🔥 Gives every star a shifting hue cycle (spanning deep blues, cyans, and white-hot tints)
        hue: 190 + Math.random() * 40, 
        ...star,
      };
    }

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(initStar());
    }

    function draw() {
      if (!ctx || !canvas) return;

      // 🌟 MAGIC BLUR EFFECT: Instead of clearing the canvas instantly, we draw an ultra-faint
      // semi-transparent black layer. This causes moving items to leave a beautiful glowing trail.
      ctx.fillStyle = "rgba(17, 37, 69, 0.08)"; // Uses your exact dark brand blue background color code
      ctx.fillRect(0, 0, width, height);

      // Turn on native hardware-accelerated overlay glow blending
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < STAR_COUNT; i++) {
        const star = stars[i];

        star.prevZ = star.z;
        star.z -= SPEED;

        if (star.z <= 0) {
          stars[i] = initStar({ z: width });
          continue;
        }

        const sx = (star.x / star.z) * (width * 0.6) + centerX;
        const sy = (star.y / star.z) * (width * 0.6) + centerY;

        const px = (star.x / star.prevZ) * (width * 0.6) + centerX;
        const py = (star.y / star.prevZ) * (width * 0.6) + centerY;

        // Don't render stars that fall outside the screen boundary line
        if (sx < 0 || sx > width || sy < 0 || sy > height) {
          continue;
        }

        const alpha = Math.min(1 - star.z / width, 1);

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);

        // 🔥 BEAUTIFUL GRADIENT COLORING: Makes the stars burn white-hot in the center
        // and fade out into glowing neon cyber blue/cyan wings as they pass the viewer
        ctx.strokeStyle = `hsla(${star.hue}, 95%, ${Math.min(50 + alpha * 50, 100)}%, ${alpha})`;
        
        // 📐 THICKER TRAILS: Makes the star elements punch through and look much more distinct
        ctx.lineWidth = Math.max(0.75, (1 - star.z / width) * 3.5); 
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Reset blending mode back to standard layout rendering
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1.0;
      
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