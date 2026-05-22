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

    // Track center position dynamically for resizing
    let centerX = width / 2;
    let centerY = height / 2;

    // Star configuration parameters
    const STAR_COUNT = 180; 
    const SPEED = 2.5;       // Speed of warp movement

    interface Star {
      x: number;
      y: number;
      z: number;
      prevZ: number;
    }

    const stars: Star[] = [];

    // Initialize stars with random positions
    function initStar(star: Partial<Star> = {}): Star {
      return {
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * width,
        prevZ: 0,
        ...star,
      };
    }

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(initStar());
    }

    // Main animation loops
    function draw() {
      if (!ctx || !canvas) return;

      // Clear the canvas with absolute transparency every frame
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < STAR_COUNT; i++) {
        const star = stars[i];

        // Save current Z position to draw the trailing streak
        star.prevZ = star.z;
        // Move the star closer to the screen layer
        star.z -= SPEED;

        // Reset the star to the background plane if it flies off-screen
        if (star.z <= 0) {
          stars[i] = initStar({ z: width });
          continue;
        }

        // Calculate 3D perspective projection coordinates ($X_p = \frac{X \cdot \text{scale}}{Z}$)
        const sx = (star.x / star.z) * (width * 0.6) + centerX;
        const sy = (star.y / star.z) * (width * 0.6) + centerY;

        // Calculate tail streak project point based on previous frame depth
        const px = (star.x / star.prevZ) * (width * 0.6) + centerX;
        const py = (star.y / star.prevZ) * (width * 0.6) + centerY;

        // Fade star brightness out dynamically if it's way back in the depth distance
        const alpha = Math.min(1 - star.z / width, 1);

        // Render the star as a clean line streak pointing outward from dead-center
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(0.5, (1 - star.z / width) * 2.5); // Thicker line as it gets closer
        ctx.globalAlpha = alpha;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0; // Reset canvas global transparency states
      animationFrameId = requestAnimationFrame(draw);
    }

    // Handles viewport display shifts cleanly
    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      centerX = width / 2;
      centerY = height / 2;
    }

    window.addEventListener("resize", handleResize);
    draw();

    // Clean up animation loops when components unmount
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