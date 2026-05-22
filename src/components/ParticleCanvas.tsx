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
  particleDensity: 7,               // Higher = more particles
  particleDensityFalloff: 0.75,     // 1 = linear, < 1 = less dense as screen size increases
  connectionDistance: 150,
  cursorConnectionMultiplier: 1.5,

  particleMinRadius: 1,
  particleMaxRadius: 3,
  particleMinOpacity: 0.5,//0.2,
  particleMaxOpacity: 0.9,//0.7,
  particleSpeed: 0.5,

  lineWidth: 0.5,
  lineMaxOpacity: 0.6,
  cursorLineWidth: 2,
  cursorLineMaxOpacity: 0.8,

  glowEnabled: true,
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    const mouse = { x: -1000, y: -1000 };

    function targetCount(w: number, h: number) {
      const areaUnits = (w * h) / 100_000;
      return Math.max(1, Math.round(
        CONFIG.particleDensity * Math.pow(areaUnits, CONFIG.particleDensityFalloff),
      ));
    }

    function spawnParticle(): Particle {
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * CONFIG.particleSpeed,
        vy: (Math.random() - 0.5) * CONFIG.particleSpeed,
        radius:
          Math.random() * (CONFIG.particleMaxRadius - CONFIG.particleMinRadius) +
          CONFIG.particleMinRadius,
        opacity:
          Math.random() * (CONFIG.particleMaxOpacity - CONFIG.particleMinOpacity) +
          CONFIG.particleMinOpacity,
      };
    }

    function resize() {
      const oldW = canvas!.width;
      const oldH = canvas!.height;

      canvas!.width = canvas!.clientWidth;
      canvas!.height = canvas!.clientHeight;

      if (oldW > 0 && oldH > 0 && particles.length > 0) {
        const sx = canvas!.width / oldW;
        const sy = canvas!.height / oldH;
        for (const p of particles) {
          p.x = Math.min(p.x * sx, canvas!.width);
          p.y = Math.min(p.y * sy, canvas!.height);
        }
      }

      const desired = targetCount(canvas!.width, canvas!.height);
      if (particles.length > desired) {
        particles.length = desired;
      } else {
        while (particles.length < desired) {
          particles.push(spawnParticle());
        }
      }
    }

    function createParticles() {
      const count = targetCount(canvas!.width, canvas!.height);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(spawnParticle());
      }
    }

    function hexToRgb(hex: string): [number, number, number] {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [108, 99, 255];
    }

    const [r, g, b] = hexToRgb(color);
    const cursorDist = CONFIG.connectionDistance * CONFIG.cursorConnectionMultiplier;

    function drawLine(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      baseOpacity: number,
      width: number,
      glowStrength: number,
      pulseIntensity: number,
      sweepPx: number,
    ) {
      ctx!.beginPath();
      ctx!.moveTo(x1, y1);
      ctx!.lineTo(x2, y2);
      ctx!.lineWidth = width;

      if (pulseIntensity > 0) {
        const peakOpacity = Math.min(
          baseOpacity * (1 + pulseIntensity * (CONFIG.glowPulseBrightness - 1)),
          1,
        );
        ctx!.shadowColor = `rgba(${r}, ${g}, ${b}, ${peakOpacity * pulseIntensity})`;
        ctx!.shadowBlur = glowStrength * CONFIG.glowIntensity * pulseIntensity;

        const dx = x2 - x1;
        const lineT = Math.abs(dx) > 1
          ? Math.max(0, Math.min(1, (sweepPx - x1) / dx))
          : 0.5;

        const spread = CONFIG.glowPulseSpread;
        const lo = Math.max(0, lineT - spread);
        const hi = Math.min(1, lineT + spread);

        const base = `rgba(${r}, ${g}, ${b}, ${baseOpacity})`;
        const peak = `rgba(${r}, ${g}, ${b}, ${peakOpacity})`;

        const grad = ctx!.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, base);
        grad.addColorStop(lo, base);
        grad.addColorStop(lineT, peak);
        grad.addColorStop(hi, base);
        grad.addColorStop(1, base);

        ctx!.strokeStyle = grad;
      } else {
        ctx!.shadowBlur = 0;
        ctx!.shadowColor = "transparent";
        ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${baseOpacity})`;
      }

      ctx!.stroke();
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      const sweepW = CONFIG.glowSweepWidth;
      let sweepNorm = -2;
      let sweepPx = -2 * w;

      if (CONFIG.glowEnabled) {
        const cycle = CONFIG.glowPulseDuration + CONFIG.glowPulseGap;
        const elapsed = (performance.now() / 1000) % cycle;
        if (elapsed < CONFIG.glowPulseDuration) {
          const t = elapsed / CONFIG.glowPulseDuration;
          sweepNorm = -sweepW + t * (1 + 2 * sweepW);
          sweepPx = sweepNorm * w;
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx!.shadowBlur = 0;
        ctx!.shadowColor = "transparent";
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
        ctx!.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.connectionDistance) {
            const t = 1 - dist / CONFIG.connectionDistance;
            const midNorm = (p.x + p2.x) / (2 * w);
            const intensity = sweepNorm > -2
              ? Math.max(0, 1 - Math.abs(sweepNorm - midNorm) / sweepW)
              : 0;
            drawLine(
              p.x, p.y, p2.x, p2.y,
              t * CONFIG.lineMaxOpacity,
              CONFIG.lineWidth,
              t,
              intensity,
              sweepPx,
            );
          }
        }

        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < cursorDist) {
          const t = 1 - mDist / cursorDist;
          const midNorm = (p.x + mouse.x) / (2 * w);
          const intensity = sweepNorm > -2
            ? Math.max(0, 1 - Math.abs(sweepNorm - midNorm) / sweepW)
            : 0;
          drawLine(
            p.x, p.y, mouse.x, mouse.y,
            t * CONFIG.cursorLineMaxOpacity,
            CONFIG.cursorLineWidth,
            t * 1.5,
            intensity,
            sweepPx,
          );
        }
      }

      ctx!.shadowBlur = 0;
      ctx!.shadowColor = "transparent";

      animationId = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function onMouseLeave() {
      mouse.x = -1000;
      mouse.y = -1000;
    }

    resize();
    createParticles();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
