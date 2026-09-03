"use client";

import { useEffect, useRef } from "react";
import "./color-depth.css";

const MATERIALS = [
  "glossy",
  "glow",
  "metal",
  "layered",
  "inset",
  "glass",
  "neon",
  "duotone",
  "satin",
  "foil",
] as const;

function bindDepth(root: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    root.querySelectorAll(".depth-metal, .depth-foil").forEach((el) => {
      const node = el as HTMLElement;
      if (node.dataset.depthBound) return;
      node.dataset.depthBound = "1";
      let raf = 0;
      let px = 0.5;
      let py = 0.5;
      const write = () => {
        raf = 0;
        node.style.setProperty("--pointer-x", `${(px * 100).toFixed(1)}%`);
        node.style.setProperty("--pointer-y", `${(py * 100).toFixed(1)}%`);
        node.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
        node.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
        node.style.setProperty("--shine-angle", `${(110 + (px - 0.5) * 50).toFixed(1)}deg`);
      };
      node.addEventListener(
        "pointermove",
        (e) => {
          const r = node.getBoundingClientRect();
          if (r.width && r.height) {
            px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
            py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
          }
          if (!raf) raf = requestAnimationFrame(write);
        },
        { passive: true },
      );
      node.addEventListener("pointerleave", () => {
        px = 0.5;
        py = 0.5;
        if (!raf) raf = requestAnimationFrame(write);
      });
    });
  }
}

export function ColorDepthPlay() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (root.current) bindDepth(root.current);
  }, []);

  return (
    <div ref={root} className="flex flex-wrap gap-3">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="liquid-glass-filter" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
          </filter>
        </defs>
      </svg>
      {MATERIALS.map((m) =>
        m === "foil" ? (
          <button key={m} type="button" className="depth-btn depth-foil">
            <span aria-hidden className="depth-foil-l depth-foil-base" />
            <span aria-hidden className="depth-foil-l depth-foil-film" />
            <span aria-hidden className="depth-foil-l depth-foil-pearl" />
            <span className="depth-label">{m}</span>
            <span aria-hidden className="depth-foil-l depth-foil-shine" />
            <span aria-hidden className="depth-foil-l depth-foil-glare" />
          </button>
        ) : (
          <button key={m} type="button" className={`depth-btn depth-${m}`}>
            <span className="depth-label">{m}</span>
          </button>
        ),
      )}
    </div>
  );
}
