"use client";

import { useMemo, useState } from "react";
import { FadeGrid } from "./FadeGrid";
import { useQuiet } from "./use-quiet";

export { FadeGrid };

const TILES = [
  "#ff4d3a",
  "#ff7a59",
  "#2fbf71",
  "#ff5ea8",
  "#ff8a3d",
  "#3ad29f",
  "#ff3d6e",
  "#7adf4a",
];

export function WarpGrid() {
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null);
  const n = 8;

  const cols = useMemo(() => {
    const weights = Array.from({ length: n }, (_, c) => {
      if (!pt) return 1;
      const d = Math.abs(c + 0.5 - pt.x * n);
      return 0.42 + d * 0.22;
    });
    return weights.map((w) => `${w}fr`).join(" ");
  }, [pt]);

  const rows = useMemo(() => {
    const weights = Array.from({ length: n }, (_, r) => {
      if (!pt) return 1;
      const d = Math.abs(r + 0.5 - pt.y * n);
      return 0.42 + d * 0.22;
    });
    return weights.map((w) => `${w}fr`).join(" ");
  }, [pt]);

  return (
    <div
      className="stage aspect-square w-full max-w-[22rem] p-2"
      onPointerLeave={() => setPt(null)}
      onPointerMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        setPt({
          x: (e.clientX - box.left) / box.width,
          y: (e.clientY - box.top) / box.height,
        });
      }}
    >
      <div
        className="grid h-full w-full gap-[3px]"
        style={{ gridTemplateColumns: cols, gridTemplateRows: rows }}
      >
        {Array.from({ length: n * n }, (_, i) => {
          const color = TILES[i % TILES.length];
          return (
            <div
              key={i}
              className="min-h-0 min-w-0 rounded-[3px]"
              style={{
                background: `linear-gradient(135deg, ${color}, #1b1b1b)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function WaveGrid() {
  const quiet = useQuiet();
  const cols = 6;
  const rows = 4;
  const colors = ["#1f7fc4", "#7eb8e4", "#d7ecfa", "#0d4f86"];

  return (
    <div className="stage grid h-[20rem] grid-cols-6 gap-2 bg-[#eef4f8] p-3 [perspective:900px]">
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const delay = quiet ? 0 : (c + r) * 0.12;
        return (
          <div
            key={i}
            className="min-h-0 rounded-md"
            style={{
              background: colors[(c + r) % colors.length],
              transformStyle: "preserve-3d",
              animation: quiet
                ? undefined
                : `bakai-flip 4.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s infinite`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes bakai-flip {
          from { transform: rotate3d(1, 1, 0, 0deg); }
          to { transform: rotate3d(1, 1, 0, 360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes bakai-flip {
            from, to { transform: none; }
          }
        }
      `}</style>
    </div>
  );
}

export function OpGrid() {
  return (
    <div className="stage relative overflow-hidden bg-[#f3f1ea] px-8 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #1b1b1b 0 1px, transparent 1px 14px), repeating-linear-gradient(0deg, #1b1b1b 0 1px, transparent 1px 14px)",
          maskImage:
            "radial-gradient(circle at 30% 40%, #000 0 18%, transparent 52%)",
        }}
      />
      <p className="name relative text-[2rem]">Intent</p>
      <p className="relative mt-3 max-w-[22rem] text-[0.95rem] text-body">
        Some description text that sits under the title and carries most of the
        weight below.
      </p>
    </div>
  );
}
