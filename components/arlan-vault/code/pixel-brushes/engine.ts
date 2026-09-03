// Pixel brushes — framework-free Canvas 2D.
//
// Canvas 2D rather than WebGL: a stroke is a few hundred axis-aligned filled
// rects with no per-pixel maths, and fillRect gives hard pixel edges for free.
// Hard edges are the point of a pixel brush, so anything that antialiases them
// works against it.
//
// The model, end to end:
//
//   walk the path at a fixed step
//     -> every `spacing` units, drop a stamp
//        -> offset it perpendicular by `jitter`
//        -> offset it radially by `scatter`
//        -> rotate it by the path direction if `follow`
//        -> scale it down by local speed if `speedSize`
//        -> draw its cells as rects, snapped to whole device pixels
//
// Randomness comes from a seeded hash of the stamp index, not Math.random, so a
// given brush on a given path always produces the same mark — a stroke that
// redrew differently on every resize would read as noise.

import { type Brush, type Ink, INK, inkColor } from "./brushes";

/** Deterministic 0..1 from an integer. Same input, same mark, forever. */
function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export interface PathPoint {
  x: number;
  y: number;
  /** 0..1 along the path, for hue drift and taper */
  t: number;
  /** local speed 0..1, drives speedSize */
  v: number;
}

/**
 * A spiral test path.
 *
 * Curvature changes constantly along it, so a single mark shows how the stamps
 * behave on a tight bend and on a lazy one, and whether they rotate to follow.
 * Every brush looks much the same on a straight line.
 */
export function spiralPath(
  cx: number,
  cy: number,
  rMax: number,
  turns = 2.15,
  steps = 900,
): PathPoint[] {
  const pts: PathPoint[] = [];
  const a0 = -Math.PI * 0.55; // start angle, so the tail exits top-right like the sheet
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // t^0.72 rather than linear: a linear spiral crowds its turns at the centre
    // and the marks collide into a blob
    const r = rMax * Math.pow(t, 0.72);
    const a = a0 + t * turns * Math.PI * 2;
    // speed rises toward the outside, which tapers the speed-sensitive brushes
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, t, v: Math.pow(t, 0.6) });
  }
  return pts;
}

/** Turn a raw pointer trail into a path, with speed measured from the samples. */
export function trailPath(raw: { x: number; y: number }[]): PathPoint[] {
  if (raw.length < 2) return [];
  const out: PathPoint[] = [];
  let total = 0;
  const seg: number[] = [0];
  for (let i = 1; i < raw.length; i++) {
    total += Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y);
    seg.push(total);
  }
  if (total <= 0) return [];
  for (let i = 0; i < raw.length; i++) {
    const prev = raw[Math.max(0, i - 1)];
    const next = raw[Math.min(raw.length - 1, i + 1)];
    const d = Math.hypot(next.x - prev.x, next.y - prev.y);
    out.push({
      x: raw[i].x,
      y: raw[i].y,
      t: seg[i] / total,
      // normalised against a nominal fast move, so speedSize behaves the same
      // whatever the card size
      v: Math.min(1, d / 24),
    });
  }
  return out;
}

export interface StrokeOptions {
  /** 0..1 — draw only this much of the path. Drives the draw-in animation. */
  progress?: number;
  /** stamp size in px; defaults to brush.size * shortSide */
  sizePx?: number;
  /** extra hue offset applied to the whole stroke */
  hue?: number;
  /** device pixel ratio, so stamps land on whole device pixels */
  dpr?: number;
  /** ink colour; defaults to the sheet's pink */
  ink?: Ink;
  /** multiplies every cell's alpha — used to fade a whole stroke out */
  alpha?: number;
  /** draw only from this point in the path (0..1). With `progress` it makes a
   *  moving window, which is how the card's trail fades from its tail. */
  from?: number;
}

/**
 * Stamp `brush` along `path`.
 *
 * Note the pixel snapping: every cell must land on a whole device pixel or the
 * browser antialiases its edges and the marks turn to soft grey. Stamp size is
 * rounded and each rect origin floored, in device pixels — so the canvas is drawn
 * in device space with the transform reset, not in CSS space.
 */
export function stroke(
  ctx: CanvasRenderingContext2D,
  path: PathPoint[],
  brush: Brush,
  shortSide: number,
  opts: StrokeOptions = {},
) {
  if (path.length < 2) return;
  const dpr = opts.dpr ?? 1;
  const progress = opts.progress ?? 1;
  if (progress <= 0) return;
  const ink = opts.ink ?? INK;
  const alphaMul = opts.alpha ?? 1;
  if (alphaMul <= 0) return;
  const from = opts.from ?? 0;

  // Stamp size in DEVICE px, at least 1 — below that there is nothing to draw.
  const base = Math.max(1, Math.round((opts.sizePx ?? brush.size * shortSide) * dpr));
  // Spacing is authored as a fraction of stamp size, matching how the source
  // brushes express it, so a bigger brush automatically spaces out to match.
  const step = Math.max(1, base * Math.max(0.02, brush.spacing));

  // Walk the path by arc length, dropping a stamp every `step`.
  let carry = 0;
  let idx = 0;
  const limit = progress;

  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    if (a.t > limit) break;

    const dx = (b.x - a.x) * dpr;
    const dy = (b.y - a.y) * dpr;
    const segLen = Math.hypot(dx, dy);
    if (segLen <= 0) continue;
    const ux = dx / segLen;
    const uy = dy / segLen;
    const ang = Math.atan2(uy, ux);

    let travelled = carry;
    while (travelled < segLen) {
      const f = travelled / segLen;
      const t = a.t + (b.t - a.t) * f;
      if (t > limit) break;
      // Below the window: still step the index so the seeded randomness stays
      // attached to its stamp, or the marks reshuffle as the window moves.
      if (t < from) {
        idx++;
        travelled += step;
        continue;
      }

      const v = a.v + (b.v - a.v) * f;
      let px = (a.x * dpr + dx * f);
      let py = (a.y * dpr + dy * f);

      const h1 = hash(idx * 2.17);
      const h2 = hash(idx * 3.71 + 11.3);
      const h3 = hash(idx * 5.13 + 27.9);

      // jitter: perpendicular to travel, so the line wanders without leaving itself
      if (brush.jitter > 0) {
        const j = (h1 - 0.5) * 2 * brush.jitter * base;
        px += -uy * j;
        py += ux * j;
      }
      // scatter: free radial throw, which is what breaks a line into a spray
      if (brush.scatter > 0) {
        const sa = h2 * Math.PI * 2;
        const sr = h3 * brush.scatter * base;
        px += Math.cos(sa) * sr;
        py += Math.sin(sa) * sr;
      }

      // speed thins the mark, but never to nothing: a stamp that rounds to 0px
      // leaves a hole rather than a light patch
      const scale = brush.speedSize > 0 ? 1 - brush.speedSize * v * 0.55 : 1;
      const cell = Math.max(1, Math.round(base * scale * 0.5));

      const rot = brush.follow > 0 ? ang * brush.follow : 0;
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const hue = brush.hueDrift * t + (opts.hue ?? 0);

      for (const c of brush.cells) {
        // cell offset within the stamp, rotated if the brush follows the path
        const ox = c.x * base * 0.5;
        const oy = c.y * base * 0.5;
        const rx = ox * cos - oy * sin;
        const ry = ox * sin + oy * cos;
        const w = Math.max(1, Math.round(cell * c.s));
        // floor, not round: adjacent stamps tile exactly instead of overlapping
        // by a pixel and darkening the seam
        const x = Math.floor(px + rx - w / 2);
        const y = Math.floor(py + ry - w / 2);
        ctx.fillStyle = inkColor(ink, hue, c.a * alphaMul);
        ctx.fillRect(x, y, w, w);
      }

      idx++;
      travelled += step;
    }
    carry = travelled - segLen;
  }
}
