export type Ease = (t: number) => number;

export interface ResolvedTransition {
  duration: number;
  ease: Ease;
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const cubicBezier = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): Ease => {
  const at = (a: number, b: number, t: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let i = 0; i < 24; i++) {
      if (at(x1, x2, t) < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return at(y1, y2, t);
  };
};

const easeOutCubic = cubicBezier(0.33, 1, 0.68, 1);
const easeInOutCubic = cubicBezier(0.65, 0, 0.35, 1);

export const bakedTransitions: ResolvedTransition[] = [
  { duration: 0.15, ease: easeOutCubic },
  { duration: 0.35, ease: easeInOutCubic },
  { duration: 0.2, ease: easeOutCubic },
  { duration: 0.2, ease: easeOutCubic },
];
