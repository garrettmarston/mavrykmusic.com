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

    // Default physical centers
    let defaultCenterX = width / 2;
    let defaultCenterY = height / 2;

    // 🔥 Track mouse targets for steering
    let targetCenterX = defaultCenterX;
    let targetCenterY = defaultCenterY;
    let currentCenterX = defaultCenterX;
    let currentCenterY = defaultCenterY;

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
        x: (Math.random() - 0.5) * width * 1.5, // Wider spread for steering clearance
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * width,
        prevZ: 0,
        hue: 195 + Math.random() * 35, 
        ...star,
      };
    }

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(initStar());
    }

    function draw() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      // 🏎️ Linear interpolation (Easing math) makes the steering transition incredibly fluid
      currentCenterX += (targetCenterX - currentCenterX) * 0.06;
      currentCenterY += (targetCenterY - currentCenterY) * 0.06;

      for (let i = 0; i < STAR_COUNT; i++) {
        const star = stars[i];

        star.prevZ = star.z;
        star.z -= SPEED;

        if (star.z <= 0) {
          stars[i] = initStar({ z: width });
          continue;
        }

        // Apply perspective calculation with the moving origin points
        const sx = (star.x / star.z) * (width * 0.6) + currentCenterX;
        const sy = (star.y / star.z) * (width * 0.6) + currentCenterY;

        const trailStretch = star.prevZ + (SPEED * 2.5);
        const px = (star.x / trailStretch) * (width * 0.6) + currentCenterX;
        const py = (star.y / trailStretch) * (width * 0.6) + currentCenterY;

        if (sx < 0 || sx > width || sy < 0 || sy > height) {
          continue;
        }

        const alpha = Math.min(1 - star.z / width, 1);

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);

        ctx.strokeStyle = `hsla(${star.hue}, 95%, ${Math.min(50 + alpha * 50, 100)}%, ${alpha * 0.8})`;
        ctx.lineWidth = Math.max(0.75, (1 - star.z / width) * 3.5); 
        ctx.lineCap = "round";
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
      animationFrameId = requestAnimationFrame(draw);
    }

    // 🖱️ Mouse and Touch Movement listeners
    function handleMouseMove(e: MouseEvent) {
      // Moves origin slightly in response to mouse displacement
      const deltaX = e.clientX - defaultCenterX;
      const deltaY = e.clientY - defaultCenterY;
      targetCenterX = defaultCenterX + deltaX * 0.25;
      targetCenterY = defaultCenterY + deltaY * 0.25;
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - defaultCenterX;
      const deltaY = e.touches[0].clientY - defaultCenterY;
      targetCenterX = defaultCenterX + deltaX * 0.25;
      targetCenterY = defaultCenterY + deltaY * 0.25;
    }

    function resetCenter() {
      targetCenterX = defaultCenterX;
      targetCenterY = defaultCenterY;
    }

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      defaultCenterX = width / 2;
      defaultCenterY = height / 2;
      resetCenter();
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mouseleave", resetCenter);

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", resetCenter);
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