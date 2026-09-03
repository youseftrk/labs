// Pixel brushes — the brush model.
//
// A brush is a shape stamped repeatedly along a path. Five numbers control how
// each stamp is placed: spacing, jitter, scatter, follow and speedSize. Together
// they cover everything from a crisp line to a loose spray.
//
// Stamps are axis-aligned squares, sometimes several per stamp at different
// opacities. Everything is generated — no bitmap textures.

export interface Brush {
  id: string;
  /** shown in the swatch caption */
  name: string;

  // ── the five numbers ──────────────────────────────────────────────────────
  /** gap between stamps, as a fraction of stamp size. Small = a solid line,
   *  large = separate marks with paper between them. */
  spacing: number;
  /** perpendicular wander of the stamp centre, fraction of stamp size. Moves the
   *  line off itself without breaking it up. */
  jitter: number;
  /** free radial offset per stamp, fraction of stamp size. This is what turns a
   *  line into a spray — the stamps stop belonging to the path. */
  scatter: number;
  /** 0 = stamps keep a fixed angle, 1 = they rotate to follow the path. On a
   *  curve this is very visible: fixed squares read as a pixel grid the line
   *  passes through, following ones read as a ribbon. */
  follow: number;
  /** how much speed shrinks the stamp, 0..1. Gives a stroke its taper. */
  speedSize: number;

  // ── the stamp ─────────────────────────────────────────────────────────────
  /** cells that make up one stamp, in stamp-local units (-1..1), each with its
   *  own alpha. One cell is a plain square; several make a cluster or a
   *  checkerboard. */
  cells: { x: number; y: number; s: number; a: number }[];
  /** base stamp size as a fraction of the swatch's short side */
  size: number;
  /** degrees of hue drift along the stroke; 0 for the single-colour brushes */
  hueDrift: number;
}

/** One square, the default stamp. */
const ONE = [{ x: 0, y: 0, s: 1, a: 1 }];

/** A diagonal run of squares at falling opacity. Stamped along a path, each one
 *  lays a short diagonal and consecutive stamps interlock into a weave. */
function diagonal(n: number, fade: number) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    out.push({ x: (t - 0.5) * 2, y: (t - 0.5) * 2, s: 1, a: 1 - t * fade });
  }
  return out;
}

/** A few squares around the centre. Offsets are fixed, not random, so a brush
 *  produces the same mark every time. */
const CLUMP = [
  { x: -0.55, y: 0.15, s: 0.9, a: 1 },
  { x: 0.45, y: -0.5, s: 1.05, a: 0.92 },
  { x: 0.3, y: 0.6, s: 0.8, a: 0.85 },
];

/** A short vertical bar of cells — reads as a row/comb rather than a dot. */
function bar(n: number, s: number) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({ x: 0, y: (i / (n - 1) - 0.5) * 2, s, a: 1 });
  }
  return out;
}

// The brush set. Ordered tightest to loosest: a line, then a woven fill, then
// progressively more scatter until the marks stop touching.
export const BRUSHES: Brush[] = [
  {
    id: "line-fine",
    name: "Line fine",
    spacing: 0.026,
    jitter: 0,
    scatter: 0,
    follow: 0,
    speedSize: 0,
    cells: ONE,
    size: 0.030,
    hueDrift: 0,
  },
  {
    id: "line-medium",
    name: "Line medium",
    spacing: 0.195,
    jitter: 0,
    scatter: 0,
    follow: 0,
    speedSize: 0,
    cells: ONE,
    size: 0.055,
    hueDrift: 0,
  },
  {
    id: "checker",
    name: "Checkerboard",
    spacing: 0.195,
    jitter: 0,
    scatter: 0,
    // follows the path, so the diagonal stamp swings with the curve and weaves
    follow: 1,
    speedSize: 0,
    cells: diagonal(4, 0.55),
    size: 0.055,
    hueDrift: 0,
  },
  {
    id: "checker-angled",
    name: "Checker angled",
    spacing: 0.130,
    jitter: 0,
    scatter: 0,
    follow: 0,
    speedSize: 0,
    cells: diagonal(3, 0.35),
    size: 0.048,
    hueDrift: 0,
  },
  {
    id: "rows",
    name: "Rows",
    spacing: 0.170,
    jitter: 0.115,
    scatter: 0,
    follow: 1,
    speedSize: 0.563,
    cells: bar(3, 0.8),
    size: 0.055,
    hueDrift: 12,
  },
  {
    id: "bunch",
    name: "Bunch",
    spacing: 0.221,
    jitter: 0.030,
    scatter: 0.042,
    follow: 1,
    speedSize: 0.611,
    cells: CLUMP,
    size: 0.048,
    hueDrift: 0,
  },
  {
    id: "scatter-light",
    name: "Scatter light",
    spacing: 0.304,
    jitter: 0.103,
    scatter: 0,
    follow: 0,
    speedSize: 0.668,
    cells: ONE,
    size: 0.042,
    hueDrift: 0,
  },
  {
    id: "scatter-heavy",
    name: "Scatter heavy",
    spacing: 0.087,
    jitter: 0.184,
    scatter: 0.042,
    follow: 1,
    speedSize: 0.563,
    cells: ONE,
    size: 0.040,
    hueDrift: 0,
  },
  {
    id: "cluster",
    name: "Cluster",
    spacing: 0.195,
    // loosest in the set: stamps thrown a full stamp-width off the line
    scatter: 1.0,
    jitter: 0,
    follow: 0,
    speedSize: 0,
    cells: ONE,
    size: 0.048,
    hueDrift: 0,
  },
  {
    id: "shader",
    name: "Shader",
    spacing: 0.199,
    jitter: 0.212,
    scatter: 0.5,
    follow: 0.5,
    speedSize: 1.0,
    cells: CLUMP,
    size: 0.055,
    hueDrift: 0,
  },
  {
    id: "paint",
    name: "Paint",
    spacing: 0.114,
    jitter: 0.006,
    scatter: 0,
    follow: 1,
    speedSize: 0.25,
    cells: ONE,
    size: 0.062,
    hueDrift: 16,
  },
  {
    id: "rainbow",
    name: "Rainbow",
    spacing: 0.087,
    jitter: 0.184,
    scatter: 0.042,
    follow: 1,
    speedSize: 0.563,
    cells: ONE,
    size: 0.040,
    // scatter-heavy plus colour drift along the stroke
    hueDrift: 300,
  },
];

/** Looked up by id, not index — the array order is presentational and may change. */
export const DEFAULT_BRUSH =
  BRUSHES.find((b) => b.id === "scatter-heavy") ?? BRUSHES[0];

/** Ink colour, as HSL parts. Hue is what the rainbow brushes drift. */
export interface Ink {
  h: number;
  s: number;
  l: number;
}

/** The pink family from the source sheet: hot pink on white. */
export const INK: Ink = { h: 336, s: 82, l: 56 };

/** The default plate: a hair off pure white, so ink sits on paper. */
export const PAPER = "#fdfcfc";

export function inkColor(ink: Ink, hueOffset: number, alpha: number): string {
  const h = (((ink.h + hueOffset) % 360) + 360) % 360;
  return `hsl(${h} ${ink.s}% ${ink.l}% / ${alpha})`;
}

/* ------------------------------------------------------------------ *
 * Remix — a random but always-legible brush + palette.
 * ------------------------------------------------------------------ */

/** Rough relative luminance of an HSL ink, 0..1. A legibility guard, not colour science. */
function inkLuma(ink: Ink): number {
  const s = ink.s / 100;
  const l = ink.l / 100;
  // saturated hues read darker than their lightness suggests, so weight them down
  return l * (1 - s * 0.35);
}

/**
 * A random ink + paper pair that is always readable. Colours are generated
 * freely, then the ink is darkened until it clears a contrast floor — otherwise
 * a roll eventually lands pale-yellow on white and the stroke disappears.
 */
export function remixPalette(rand: () => number): { ink: Ink; paper: string } {
  const ink: Ink = {
    h: Math.floor(rand() * 360),
    s: 55 + rand() * 40,
    l: 40 + rand() * 20,
  };

  // Paper is a full colour, not just a paper-white. Four families, weighted so
  // pale plates stay the common case and the louder ones arrive as a surprise.
  const roll = rand();
  const paperHue =
    rand() < 0.5 ? (ink.h + 180) % 360 : Math.floor(rand() * 360);
  let paperSat: number;
  let paperLight: number;
  if (roll < 0.4) {
    // pale tint — the classic sheet
    paperSat = rand() < 0.4 ? 0 : 8 + rand() * 16;
    paperLight = 92 + rand() * 6;
  } else if (roll < 0.65) {
    // soft colour: a proper coloured ground, still light enough to read on
    paperSat = 30 + rand() * 45;
    paperLight = 78 + rand() * 12;
  } else if (roll < 0.85) {
    // dark plate — ink goes light against it, handled by the guard below
    paperSat = 18 + rand() * 40;
    paperLight = 10 + rand() * 14;
  } else {
    // near-black or near-white extreme
    paperSat = rand() * 12;
    paperLight = rand() < 0.5 ? 4 + rand() * 6 : 97 + rand() * 3;
  }
  const paper = `hsl(${paperHue} ${paperSat}% ${paperLight}%)`;

  // Legibility guard, both directions: push the ink away from the paper until
  // there is a clear gap. On a dark plate that means lightening it, which is why
  // this cannot be a one-way darken.
  const paperLuma = paperLight / 100;
  const goDark = paperLuma > 0.5;
  let guard = 0;
  while (Math.abs(inkLuma(ink) - paperLuma) < 0.3 && guard++ < 24) {
    ink.l += goDark ? -4 : 4;
    ink.l = Math.min(92, Math.max(12, ink.l));
    // clamped at both ends: if lightness alone cannot open the gap, drop the
    // saturation instead, which moves luminance the rest of the way
    if (ink.l <= 12 || ink.l >= 92) ink.s = Math.max(25, ink.s - 6);
  }

  return { ink, paper };
}

/* ------------------------------------------------------------------ *
 * Generated stamps
 *
 * Remix invents a stamp shape rather than reusing one from the set above, so a
 * remixed brush is one that is not in the list. Each generator returns cells in
 * stamp-local -1..1 space, the same format as the authored stamps.
 * ------------------------------------------------------------------ */

type Cells = Brush["cells"];

/** A hollow ring of cells — draws as a tube or a chain depending on spacing. */
function ring(n: number, rand: () => number): Cells {
  const out: Cells = [];
  const phase = rand() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const a = phase + (i / n) * Math.PI * 2;
    out.push({ x: Math.cos(a), y: Math.sin(a), s: 0.85, a: 1 });
  }
  return out;
}

/** Two parallel rows of cells — reads as a comb, or as tyre tread on a curve. */
function comb(n: number, gap: number): Cells {
  const out: Cells = [];
  for (let i = 0; i < n; i++) {
    const t = (i / Math.max(1, n - 1) - 0.5) * 2;
    out.push({ x: t, y: -gap, s: 0.8, a: 1 });
    out.push({ x: t, y: gap, s: 0.8, a: 0.85 });
  }
  return out;
}

/** A plus / cross of cells. Fixed it reads as a grid of crosses; following the
 *  path it reads as a rail with sleepers. */
function cross(arm: number): Cells {
  const out: Cells = [{ x: 0, y: 0, s: 1, a: 1 }];
  for (let i = 1; i <= arm; i++) {
    const t = i / arm;
    const a = 1 - t * 0.5;
    out.push({ x: t, y: 0, s: 0.75, a });
    out.push({ x: -t, y: 0, s: 0.75, a });
    out.push({ x: 0, y: t, s: 0.75, a });
    out.push({ x: 0, y: -t, s: 0.75, a });
  }
  return out;
}

/** A sparse cloud of cells. Offsets are rolled once, so the spatter is stable. */
function cloud(n: number, rand: () => number): Cells {
  const out: Cells = [];
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.pow(rand(), 0.6);
    out.push({
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      s: 0.5 + rand() * 0.7,
      a: 0.5 + rand() * 0.5,
    });
  }
  return out;
}

/** A wedge: cells along one axis at shrinking size, so each stamp has a nose and
 *  a tail. Following the path this reads as a calligraphic nib. */
function wedge(n: number): Cells {
  const out: Cells = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    out.push({ x: (t - 0.5) * 2, y: 0, s: 1 - t * 0.7, a: 1 - t * 0.3 });
  }
  return out;
}

/** Named stamp generators, so a remix reads as a preset rather than a dice roll. */
const STAMPS: { name: string; make: (rand: () => number) => Cells }[] = [
  { name: "Ring", make: (r) => ring(4 + Math.floor(r() * 4), r) },
  { name: "Comb", make: (r) => comb(2 + Math.floor(r() * 3), 0.5 + r() * 0.5) },
  { name: "Cross", make: (r) => cross(1 + Math.floor(r() * 2)) },
  { name: "Spatter", make: (r) => cloud(3 + Math.floor(r() * 4), r) },
  { name: "Nib", make: (r) => wedge(3 + Math.floor(r() * 3)) },
  { name: "Dot", make: () => [{ x: 0, y: 0, s: 1, a: 1 }] },
  { name: "Weave", make: (r) => diagonal(3 + Math.floor(r() * 3), 0.3 + r() * 0.5) },
];

/** Adjective derived from the numbers, so the name describes the brush. */
function describe(b: Omit<Brush, "id" | "name">): string {
  if (b.scatter > 0.6) return "spray";
  if (b.spacing > 0.35) return "dotted";
  if (b.spacing < 0.06) return "solid";
  if (b.jitter > 0.18) return "rough";
  if (b.follow >= 1) return "flowing";
  return "even";
}

/**
 * A remix brush: an invented stamp plus a full roll of the five numbers. Nothing
 * is inherited from the set above. Ranges are wide, with guards that keep the
 * result a brush rather than static.
 */
export function remixBrush(rand: () => number): Brush {
  const stamp = STAMPS[Math.floor(rand() * STAMPS.length)];
  const cells = stamp.make(rand);

  // Curved rather than uniform: a flat roll would make most remixes dotted.
  const spacing = 0.02 + Math.pow(rand(), 1.8) * 0.55;
  const scatter = rand() < 0.45 ? 0 : Math.pow(rand(), 1.4) * 1.0;
  const jitter = rand() < 0.4 ? 0 : Math.pow(rand(), 1.5) * 0.3;
  // follow is a mode (fixed vs. rotating with the path), so it is snapped.
  const follow = rand() < 0.45 ? 0 : rand() < 0.75 ? 1 : 0.5;
  const speedSize = rand() < 0.5 ? 0 : rand();
  // Scale down as cell count goes up, or a busy stamp becomes a blob.
  const bulk = Math.min(1, cells.length / 8);
  const size = 0.026 + rand() * 0.055 * (1 - bulk * 0.45);
  const hueDrift = rand() < 0.75 ? 0 : Math.floor(rand() * 320);

  const parts = { spacing, jitter, scatter, follow, speedSize, cells, size, hueDrift };
  return {
    id: "remix",
    name: `${stamp.name} ${describe(parts)}`,
    ...parts,
  };
}
