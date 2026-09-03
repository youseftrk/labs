"use client";

import { useEffect, useRef } from "react";

export function FadeGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const ctx = node.getContext("2d");
    if (!ctx) return;
    const w = 560;
    const h = 280;
    node.width = w * 2;
    node.height = h * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, w, h);
    ctx.font = "700 160px var(--font-matter), sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText("YT", w / 2, h / 2 + 8);
    const img = ctx.getImageData(0, 0, node.width, node.height);
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.fillStyle = "#fcfcfc";
    ctx.fillRect(0, 0, w, h);
    const cols = 48;
    const rows = 22;
    const pitchX = w / cols;
    const pitchY = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = Math.floor((c + 0.5) * pitchX);
        const y = Math.floor((r + 0.5) * pitchY);
        const a = img.data[(y * 2 * node.width + x * 2) * 4];
        const bar = a > 40 ? pitchX * 0.82 : 1.6;
        ctx.fillStyle = "#1b1b1b";
        ctx.fillRect(
          c * pitchX + pitchX / 2 - bar / 2,
          r * pitchY + 2,
          bar,
          pitchY - 4,
        );
      }
    }
  }, []);

  return (
    <canvas
      ref={ref}
      className="stage block h-[16rem] w-full"
      aria-label="Name drawn as a grid of bars"
    />
  );
}
