"use client";

import { useEffect, useRef, useState } from "react";
import { useQuiet } from "./use-quiet";

export function DragButton() {
  const rest = 72;
  const [box, setBox] = useState({ x: 0, y: 0, w: rest, h: rest });
  const dragging = useRef(false);
  const origin = useRef({ x: 0, y: 0 });

  return (
    <div className="stage relative h-[18rem] bg-[#111]">
      <button
        type="button"
        aria-label="Hold to record"
        className="absolute bottom-6 right-6 flex items-center justify-center text-[0.8125rem] text-white"
        style={{
          width: box.w,
          height: box.h,
          borderRadius: Math.min(box.w, box.h),
          background: "rgba(40,40,40,0.92)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
          transform: `translate(${box.x}px, ${box.y}px)`,
          touchAction: "none",
        }}
        onPointerDown={(e) => {
          dragging.current = true;
          origin.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          const dx = e.clientX - origin.current.x;
          const dy = e.clientY - origin.current.y;
          setBox({
            x: Math.min(0, dx),
            y: Math.min(0, dy),
            w: rest + Math.abs(dx),
            h: rest + Math.abs(dy),
          });
        }}
        onPointerUp={() => {
          dragging.current = false;
          setBox({ x: 0, y: 0, w: rest, h: rest });
        }}
      >
        Hold
      </button>
    </div>
  );
}

export function QrReveal() {
  const ref = useRef<HTMLCanvasElement>(null);
  const quiet = useQuiet();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 21;
    const cell = 10;
    const pad = 28;
    const w = pad * 2 + size * cell;
    canvas.width = w * 2;
    canvas.height = w * 2;
    canvas.style.width = "100%";
    canvas.style.maxWidth = "18rem";
    ctx.setTransform(2, 0, 0, 2, 0, 0);

    const grid: boolean[][] = Array.from({ length: size }, (_, y) =>
      Array.from({ length: size }, (_, x) => {
        const finder = (ox: number, oy: number) => {
          const dx = Math.abs(x - ox);
          const dy = Math.abs(y - oy);
          if (dx > 3 || dy > 3) return false;
          return dx === 3 || dy === 3 || (dx < 2 && dy < 2);
        };
        if (finder(3, 3) || finder(size - 4, 3) || finder(3, size - 4)) {
          return true;
        }
        return ((x * 3 + y * 5) % 7) < 3 && x > 7 && y > 7;
      }),
    );

    const modules: { x: number; y: number }[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[y][x]) modules.push({ x, y });
      }
    }

    const particles = modules.map((m, i) => ({
      tx: pad + m.x * cell,
      ty: pad + m.y * cell,
      sx: pad + size * cell * 0.5 + Math.cos(i) * 120,
      sy: pad + size * cell * 0.5 + Math.sin(i * 1.7) * 120,
    }));

    let start = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const t = quiet ? 1 : Math.min(1, (now - start) / 900);
      const e = 1 - Math.pow(1 - t, 3);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, w);
      ctx.fillStyle = "#111";
      for (const p of particles) {
        const x = p.sx + (p.tx - p.sx) * e;
        const y = p.sy + (p.ty - p.sy) * e;
        ctx.fillRect(x, y, cell - 1, cell - 1);
      }
      if (t < 1) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [quiet]);

  return (
    <div className="stage stage-pad grid place-items-center bg-[#f6f6f4]">
      <canvas ref={ref} aria-label="QR code assembling from particles" />
    </div>
  );
}

export function Athlos() {
  const ref = useRef<HTMLCanvasElement>(null);
  const quiet = useQuiet();
  const words = ["YOUSEF", "TASTE", "VAULT"];

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = 640;
    const h = 280;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    let word = 0;
    let start = performance.now();
    let raf = 0;

    const heat = (t: number) => {
      if (t < 0.35) {
        const u = t / 0.35;
        return `rgb(${0},${Math.round(180 + 40 * u)},${Math.round(220 - 40 * u)})`;
      }
      if (t < 0.7) {
        const u = (t - 0.35) / 0.35;
        return `rgb(${Math.round(40 + 200 * u)},${Math.round(40 * (1 - u))},${Math.round(80 * (1 - u))})`;
      }
      const u = (t - 0.7) / 0.3;
      const g = Math.round(20 + 220 * u);
      return `rgb(255,${g},${g})`;
    };

    const draw = (now: number) => {
      const loop = quiet ? 1 : ((now - start) % 3000) / 3000;
      if (!quiet && now - start > 3000) {
        start = now;
        word = (word + 1) % words.length;
      }
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.font = "700 92px var(--font-matter), sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.filter = "blur(10px)";
      const cols = 48;
      for (let i = 0; i < cols; i++) {
        const ignite = i / cols;
        const local = Math.max(0, Math.min(1, (loop - ignite * 0.28) / 0.22));
        ctx.fillStyle = heat(local);
        ctx.save();
        ctx.beginPath();
        ctx.rect((w / cols) * i, 0, w / cols + 1, h);
        ctx.clip();
        ctx.fillText(words[word], w / 2, h / 2);
        ctx.restore();
      }
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [quiet]);

  return (
    <canvas
      ref={ref}
      className="stage block h-[16rem] w-full"
      aria-label="Wordmark resolving out of heat"
    />
  );
}

export function Loom() {
  const quiet = useQuiet();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (quiet) return;
    let raf = 0;
    const tick = (now: number) => {
      setT(now / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [quiet]);

  const bands = 10;
  return (
    <div className="stage flex h-[16rem] overflow-hidden bg-[#120816]">
      {Array.from({ length: bands }, (_, i) => (
        <div
          key={i}
          className="h-full min-w-0 flex-1"
          style={{
            background:
              "repeating-linear-gradient(90deg, #c9a6ff 0 10px, #fff 10px 18px, #6b3cff 18px 28px, #1b0828 28px 36px)",
            transform: `translateX(${Math.sin(t * 0.6 + i * 0.35) * 18}px)`,
          }}
        />
      ))}
    </div>
  );
}

export function RingLetters() {
  const ref = useRef<HTMLCanvasElement>(null);
  const quiet = useQuiet();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = 420;
    const h = 280;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    let raf = 0;
    const draw = (now: number) => {
      const t = quiet ? 0.45 : (now / 1000) % 12;
      ctx.fillStyle = "#f7f4ee";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#1b1b1b";
      ctx.lineWidth = 1;
      for (let i = 0; i < 18; i++) {
        const age = (t * 1.4 + i * 0.18) % 3;
        const s = 1 - age / 3;
        if (s < 0.08) continue;
        ctx.globalAlpha = s;
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.scale(0.35 + age * 0.28, 0.55 + age * 0.18);
        ctx.beginPath();
        ctx.moveTo(-40, 50);
        ctx.lineTo(-40, -50);
        ctx.lineTo(8, -50);
        ctx.quadraticCurveTo(48, -50, 48, -8);
        ctx.quadraticCurveTo(48, 18, 10, 18);
        ctx.lineTo(-40, 18);
        ctx.moveTo(6, 18);
        ctx.lineTo(46, 52);
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [quiet]);

  return (
    <canvas
      ref={ref}
      className="stage block h-[16rem] w-full"
      aria-label="Letter drawn as inward contour rings"
    />
  );
}
