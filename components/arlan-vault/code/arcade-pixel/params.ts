// Arcade pixel type — the colourways and the numbers that define the effect.
//
// Reverse-engineered from a Photoshop template (4500x3000, RGB/8). The whole
// stack in that file is five things:
//
//   Background        solid #EB0809
//   Effect/Layer      the word, as a smart object
//   Effect/Threshold  150, blending as COLOR BURN   <- the entire effect
//   Textures/         two gradients + Noise (hard light) + Dust (screen)
//                     + Noise (linear light 70%)
//   Settings/         Vibrance +20, Levels in 5->230 gamma 1.00
//
// Every number below was measured off that file rather than eyeballed.

export type Colorway = {
  name: string;
  /** The ground the word is burnt into. */
  ground: [number, number, number];
  /** The dark ink. Measured at #050605 in the source — NOT pure black, which is
   *  worth keeping: a hair of blue in the shadow stops the poster reading as a
   *  flat two-bit stencil. */
  ink: [number, number, number];
  /** The light face of the letters. */
  paper: [number, number, number];
  /** Tint of the coloured speckle along the quantised edges. */
  fringe: [number, number, number];
};

/** The measured original first — it is the card's resting identity. */
export const COLORWAYS: Colorway[] = [
  {
    // Straight off the PSD: a hot, almost pure red.
    name: "Arcade Red",
    ground: [0.922, 0.031, 0.035], // #EB0809
    ink: [0.02, 0.024, 0.02], // #050605
    paper: [1, 1, 1],
    fringe: [0.35, 1, 0.9],
  },
  {
    name: "Acid",
    ground: [0.804, 1, 0.05],
    ink: [0.04, 0.06, 0.02],
    paper: [1, 1, 0.96],
    fringe: [1, 0.2, 0.75],
  },
  {
    name: "Cyanide",
    ground: [0.04, 0.85, 0.92],
    ink: [0.01, 0.05, 0.08],
    paper: [0.96, 1, 1],
    fringe: [1, 0.35, 0.2],
  },
  {
    name: "Monochrome",
    // The one restrained colourway. With no hue to carry the poster, the
    // quantisation itself has to do all the work — which is the best possible
    // demonstration that the effect is the threshold and not the palette.
    ground: [0.9, 0.89, 0.87],
    ink: [0.04, 0.04, 0.05],
    paper: [1, 1, 1],
    fringe: [0.5, 0.55, 0.6],
  },
  {
    name: "Ultraviolet",
    ground: [0.36, 0.05, 0.85],
    ink: [0.03, 0.01, 0.08],
    paper: [0.95, 0.92, 1],
    fringe: [1, 0.85, 0.2],
  },
  {
    name: "Ember",
    ground: [1, 0.42, 0.02],
    ink: [0.08, 0.02, 0.0],
    paper: [1, 0.97, 0.9],
    fringe: [0.2, 0.7, 1],
  },
];

export interface ArcadeParams {
  word: string;
  /**
   * Where the quantised edge lands, 0..1. The PSD's Threshold is 150/255.
   *
   * This is HALF the effect. Moving it does not just brighten the letters — it
   * slides the cut along the blur ramp, so the staircase steps land in different
   * places and the letterforms visibly gain and lose blocks.
   */
  threshold: number;
  /**
   * Cells ACROSS the low-res grid. THIS IS THE BLOCK SIZE.
   *
   * Measured on the source: its smart object is 3750px wide and every edge in
   * both axes falls on an exact 25px boundary, so the art is a 150-cell grid
   * scaled up 25x. Lower is chunkier.
   *
   * Not a blur radius. Thresholding a smooth blur was an earlier attempt and it
   * does not step an edge at all, it only moves it — the blocks have to come
   * from real low resolution.
   */
  cols: number;
  /** White halo width in CELLS. Source: a 73px outside stroke / 25px = ~3. */
  halo: number;
  /** Black keyline width in CELLS. Source: 103px / 25px = ~4. It is WIDER than
   *  the halo, which is why the black shows as a band beyond the white. */
  keyline: number;
  /** How far the black keyline is pushed, in CELLS, as [dx, dy]. The source is
   *  symmetric ([0,0]); offsetting turns the outline into a hard drop shadow. */
  keylineOffset: [number, number];
  /** The source's type is a faux-italic Alternate Gothic. */
  italic: boolean;
  /** Surface strength, scaling all three real plates together.
   *
   *  1.0 is the full print. The blend amounts in the shader are already tuned so
   *  that 1.0 gives roughly the same swing on the red ground, the white letter
   *  faces and the black keyline (~0.48 each), which is what the reference does
   *  — its white faces are every bit as printed as its background. */
  texture: number;
  /** C2: the drop shadow follows the pointer. */
  magnet: boolean;
  /** How far the magnetic shadow can travel beyond its resting offset, in CELLS. */
  magnetReach: number;
  /** How far the face/halo/keyline drift toward the pointer, in uv. Small — the
   *  layers should breathe, not slide. */
  parallax: number;
  /** Magnetism: how far the whole word leans toward the pointer, in uv. */
  pull: number;
  /** S3: how hard the cursor rotates one moire grating against the other. */
  swim: number;
  /** Per-channel offset on the moire, as print misregistration. */
  separation: number;
  /** Colourway index. */
  colorway: number;
}

export const DEFAULTS: ArcadeParams = {
  word: "arcade",
  // 150/255 = 0.588, straight from the file.
  // 150/255 = 0.588, straight from the file.
  threshold: 0.588,
  // The source's own grid. At a 1344px-wide card this is a ~9px block.
  cols: 150,
  halo: 3,
  // 3, not 4. The keyline is a band BEYOND the white halo, so its width and its
  // offset compound — a 4-cell band pushed 2 cells reads as a slab behind the
  // word rather than an edge on it.
  keyline: 3,
  // ONE cell, down and right. Two cells detached the shadow from the letter —
  // at this grid a cell is ~9px, so a 2-cell offset throws the shadow 18px clear
  // of a letter whose stroke is only a few cells thick, and the two stop reading
  // as one object. One cell is a hairline of depth, which is all this needs.
  keylineOffset: [1, 1],
  italic: true,
  // A QUARTER. The moire, grain and dust plates are lifted from the PSD and at
  // anything near full strength they are the loudest thing on the card — the
  // interference pattern starts reading as the subject and the type becomes the
  // background it sits on. At 0.25 the surface is still plainly there (the
  // printed-poster feel survives, which is the whole reason the plates exist)
  // but it stays a texture ON the letters rather than a pattern competing WITH
  // them. The slider still runs past 1 for anyone who wants it heavier.
  texture: 0.25,
  magnet: true,
  // The magnet swings the shadow much less far now. At 3 cells the shadow
  // travelled far enough to sit beside the word rather than under it, which
  // undid the point of shrinking the resting offset.
  magnetReach: 1,
  swim: 1,
  // ~0.9% of the frame at full reach, so the shadow travels about 12px and the
  // face about 4px. Past ~0.02 the layers visibly come apart and the letter
  // stops looking like one object.
  parallax: 0.009,
  // ~1.6% of the frame at most, so the word shifts about 20px when the cursor is
  // right beside it. Deliberately more than the parallax: the lean is the thing
  // you notice, the layer separation is the thing that makes it convincing.
  pull: 0.016,
  separation: 1,
  colorway: 0,
};

/** Stripe angle of the noise texture, in degrees.
 *
 *  Measured at ~80.5deg off the source — very close to vertical but deliberately
 *  NOT vertical. A true 90 reads as a screen artefact or a broken display; a few
 *  degrees of lean reads as a printing pass. */
export const TEXTURE_ANGLE = 80.5;

/** Stripe period as a fraction of card width. ~29px at 4500 wide. */
export const TEXTURE_PERIOD = 0.0065;

/** Levels from the source: input 5..230, gamma 1.00 (a pure contrast crush with
 *  no midtone shift), and Vibrance +20. */
export const LEVELS_IN = [5 / 255, 230 / 255] as const;
export const VIBRANCE = 0.2;

/** The face. The site's heaviest shipped weight — the effect needs fat letters,
 *  because a thin stroke does not survive being quantised into blocks. */
export const FONT_CSS = "var(--font-neue-montreal)";
export const FONT_WEIGHT = 600;
