"use client";

// Dia Browser's signature gradient — a self-contained drop-in.
//
// A row of N tall, heavily-blurred columns share one vertical gradient
// and are arranged in a symmetric bell curve (short at the edges, tallest in the
// middle). Mount rise is scaleY(0) → 1. Footer/header rise is scroll-driven
// (`rise="scroll"`). Stops are sampled from Dia's footer strip.

import { useEffect, useId, useState } from "react";

type Stop = { offset: number; color: string };

export const SITE_STOPS: Stop[] = [
  { offset: 0, color: "var(--glow-floor)" },
  { offset: 0.1, color: "var(--glow-navy)" },
  { offset: 0.2, color: "var(--glow-deep)" },
  { offset: 0.32, color: "var(--glow-sea)" },
  { offset: 0.44, color: "var(--glow-mid)" },
  { offset: 0.55, color: "var(--glow-teal)" },
  { offset: 0.68, color: "var(--glow-accent)" },
  { offset: 0.72, color: "var(--glow-lift)" },
  { offset: 0.84, color: "var(--glow-haze)" },
  { offset: 0.93, color: "var(--glow-mint)" },
  { offset: 1, color: "transparent" },
];

/** Ceiling wash: navy stays a thin lip so mint/teal can sit on the name. */
export const HEAD_STOPS: Stop[] = [
  { offset: 0, color: "var(--glow-floor)" },
  { offset: 0.05, color: "var(--glow-deep)" },
  { offset: 0.1, color: "var(--glow-sea)" },
  { offset: 0.16, color: "var(--glow-teal)" },
  { offset: 0.24, color: "var(--glow-accent)" },
  { offset: 0.36, color: "var(--glow-lift)" },
  { offset: 0.52, color: "var(--glow-haze)" },
  { offset: 0.72, color: "var(--glow-mint)" },
  { offset: 1, color: "transparent" },
];

export const DIA_STOPS = SITE_STOPS;

const VBW = 1271;
const VBH = 599;

function bellHeights(n: number, peak: number, valley: number): number[] {
  const out: number[] = [];
  const mid = (n - 1) / 2;
  for (let i = 0; i < n; i++) {
    const t = mid === 0 ? 0 : Math.abs(i - mid) / mid;
    const eased = 1 - Math.pow(t, 1.24);
    out.push(peak * VBH * (valley + (1 - valley) * eased));
  }
  return out;
}

export function DiaGradient({
  bars = 9,
  blur = 15,
  peak = 0.98,
  valley = 0.55,
  stops = SITE_STOPS,
  riseMs = 1100,
  rise = "mount",
  from = "bottom",
}: {
  bars?: number;
  blur?: number;
  peak?: number;
  valley?: number;
  stops?: Stop[];
  riseMs?: number;
  /** `scroll` fills the chrome; Motion on the parent drives scaleY. */
  rise?: "mount" | "scroll";
  from?: "bottom" | "top";
}) {
  const scroll = rise === "scroll";
  const fromTop = from === "top";
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (scroll) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || riseMs <= 0) {
      setShown(true);
      return;
    }
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setShown(true)),
    );
    return () => cancelAnimationFrame(id);
  }, [riseMs, scroll]);

  const uid = useId().replace(/:/g, "");
  const gradId = `dia-grad-${uid}`;
  const blurId = `dia-blur-${uid}`;
  const heights = bellHeights(bars, peak, valley);
  const colW = VBW / bars;
  const fromClass = fromTop ? "dia-from-top" : "dia-from-bottom";

  return (
    <div
      aria-hidden
      className={scroll ? `dia-rise dia-scroll ${fromClass}` : `dia-rise ${fromClass}`}
      style={
        scroll
          ? { height: "100%", width: "100%" }
          : {
              height: "100%",
              width: "100%",
              transformOrigin: fromTop ? "top" : "bottom",
              transform: shown ? "scaleY(1)" : "scaleY(0)",
              transition:
                riseMs > 0
                  ? `transform ${riseMs}ms cubic-bezier(0.16, 1, 0.3, 1)`
                  : undefined,
            }
      }
    >
      <svg
        style={{ height: "100%", width: "100%" }}
        viewBox={`0 0 ${VBW} ${VBH}`}
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="0"
            y1={fromTop ? "0" : "1"}
            x2="0"
            y2={fromTop ? "1" : "0"}
          >
            {stops.map((s, i) => (
              <stop key={i} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
          <filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
        {heights.map((h, i) => (
          <g key={i} filter={`url(#${blurId})`}>
            <rect
              x={i * colW}
              y={fromTop ? 0 : VBH - h}
              width={colW * 1.23}
              height={h}
              fill={`url(#${gradId})`}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
