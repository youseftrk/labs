export type Phase = "hold" | "collapse" | "resolve";

export const SEQUENCE = ["ARCADE", "PIXEL", "TYPE"];

export function nextPhase(phase: Phase): Phase {
  if (phase === "hold") return "collapse";
  if (phase === "collapse") return "resolve";
  return "hold";
}

export function phaseMs(phase: Phase): number {
  if (phase === "hold") return 2400;
  if (phase === "collapse") return 900;
  return 1100;
}

export function cellsAt(phase: Phase, t: number): number {
  const hi = 150;
  const lo = 16;
  const u = Math.max(0, Math.min(1, t));
  if (phase === "hold") return hi;
  if (phase === "collapse") return Math.round(hi + (lo - hi) * u);
  return Math.round(lo + (hi - lo) * u);
}
