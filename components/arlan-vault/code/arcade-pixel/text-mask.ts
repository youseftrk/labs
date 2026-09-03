// Rasterises the word into the three-channel field the shader paints.
//
//   R = the letter FACE      (dark ink)
//   G = the WHITE halo       (face dilated ~3 blocks)
//   B = the BLACK keyline    (face dilated ~4 blocks)
//
// ── WHAT THE SOURCE ACTUALLY DOES ───────────────────────────────────────────
//
// This was rebuilt after decoding the real PSD, and almost every guess made from
// the layer NAMES turned out to be wrong. What is actually in the file:
//
//   The word lives in an embedded smart object (Edit Content.psb) whose group
//   carries TWO Photoshop stroke effects, both position "outside":
//       73px  solid WHITE
//      103px  solid #1F1E1C (near-black)
//   The black is WIDER, so it shows as a band beyond the white — that is the
//   halo-then-keyline you see, and it is two real strokes rather than anything
//   derived from a threshold.
//
//   THE ART IS ALREADY PIXELATED BEFORE ANY ADJUSTMENT RUNS. Rendering the smart
//   object on its own — no Threshold, no textures — gives blocky letters AND
//   blocky strokes. Measured on that render: every run length and every edge in
//   both axes falls on an exact 25px boundary, in a 3750x975 object. So the
//   source is a 150 x 39 bitmap scaled up 25x, and the strokes were applied at
//   that low resolution, which is why they staircase in perfect register with
//   the glyph instead of rounding their own corners.
//
//   The Threshold 150 in color-burn on top is therefore NOT the effect. It only
//   crushes what antialiasing survives the upscale. My first two builds treated
//   it as the whole mechanism and produced soft round letters, because
//   thresholding a smooth ramp MOVES an edge without ever stepping it.
//
// So: rasterise small, dilate the strokes IN CELLS, then scale up with nearest
// neighbour. Everything quantises together because everything is computed on the
// same tiny grid.

import { FONT_WEIGHT as WEIGHT } from "./params";

export interface FieldOpts {
  word: string;
  /** Cells across the low-res grid. The source is 150 for a 3750px object. */
  cols: number;
  /** White halo width, in CELLS. Source: 73px / 25px = ~3. */
  halo: number;
  /** Black keyline width, in CELLS. Source: 103px / 25px = ~4. */
  keyline: number;
  /** How far the keyline is pushed, in CELLS, as [dx, dy].
   *
   *  The source's stroke is symmetric — it rings the letter evenly. Offsetting it
   *  turns the same shape into a hard DROP SHADOW, which is the arcade-cabinet
   *  read: a sticker printed slightly out of register, or a marquee letter with a
   *  block shadow behind it. In cells rather than pixels so the shadow lands
   *  exactly on the lattice and staircases in step with the letter instead of
   *  sliding half a block out of register. */
  keylineOffset: [number, number];
  /** Italic, like the source's faux-italic Alternate Gothic. */
  italic: boolean;
  w: number;
  h: number;
  fontFamily: string;
}

/** Grow a mask by `cells` in every direction, on the low-res grid.
 *
 *  A real morphological dilate on a handful of thousand cells — cheap, and
 *  exact. Doing this with a blur + threshold instead (the obvious shortcut)
 *  rounds the corners, and rounded corners on a blocky letter is precisely the
 *  thing that makes a rebuild of this look wrong. */
function dilate(
  src: Uint8Array,
  cols: number,
  rows: number,
  cells: number,
): Uint8Array {
  let cur = src;
  for (let pass = 0; pass < cells; pass++) {
    const out = new Uint8Array(cols * rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        if (cur[i]) {
          out[i] = 1;
          continue;
        }
        // 4-neighbourhood: grows a square, which is what a pixel-grid stroke
        // looks like. An 8-neighbourhood grows a diamond-ish blob and softens
        // the corners the whole effect depends on.
        if (
          (x > 0 && cur[i - 1]) ||
          (x < cols - 1 && cur[i + 1]) ||
          (y > 0 && cur[i - cols]) ||
          (y < rows - 1 && cur[i + cols])
        ) {
          out[i] = 1;
        }
      }
    }
    cur = out;
  }
  return cur;
}

/** SYNCHRONOUS on purpose. It is pure canvas work — a rasterise, a threshold and
 *  two dilates over ~10k cells, well under a millisecond — and the resolution
 *  animation calls it straight from the frame loop. An async signature would
 *  force that caller to await a promise that never actually yields, which lands
 *  the new mask a frame late and makes the collapse stutter. */
export function makeArcadeField(o: FieldOpts): HTMLCanvasElement {
  const W = Math.max(1, Math.round(o.w));
  const H = Math.max(1, Math.round(o.h));

  // ── 1. the LOW-RES grid ───────────────────────────────────────────────────
  const cols = Math.max(24, Math.round(o.cols));
  const rows = Math.max(8, Math.round(cols * (H / W)));

  const low = document.createElement("canvas");
  low.width = cols;
  low.height = rows;
  const lx = low.getContext("2d", { willReadFrequently: true })!;
  lx.clearRect(0, 0, cols, rows);

  const text = (o.word || "").trim();
  if (text) {
    // Leave room for the keyline: the strokes grow OUTWARD, so a word sized to
    // the full width loses its outline off the edge of the card.
    const pad = o.keyline + 2;
    // The source's cap height is ~746px of a 975px object = 0.765, and its type
    // is set in Alternate Gothic — a very condensed face. Ours is not condensed,
    // so it is sized to fit the width and the height is what it is.
    let size = rows * 0.46;
    const fit = (s: number) => {
      lx.font = `${o.italic ? "italic " : ""}${WEIGHT} ${s}px ${o.fontFamily}`;
      return lx.measureText(text).width;
    };
    // Well inside the frame. The word used to run nearly edge to edge, which
    // left the poster no ground to be a poster — the surface texture and the
    // drop shadow both need open colour around the type to read at all.
    const maxW = (cols - pad * 2) * 0.72;
    if (fit(size) > maxW) size *= maxW / fit(size);
    lx.font = `${o.italic ? "italic " : ""}${WEIGHT} ${size}px ${o.fontFamily}`;
    lx.fillStyle = "#fff";
    lx.textAlign = "center";
    lx.textBaseline = "middle";
    lx.fillText(text, cols / 2, rows * 0.5);
  }

  // ── 2. hard-quantise to a boolean grid ────────────────────────────────────
  // The rasteriser antialiases; the source has no grey at all. Cut at 50% so a
  // cell is either ink or it is not, which is what makes the dilate below
  // produce clean square growth.
  const src = lx.getImageData(0, 0, cols, rows).data;
  const face = new Uint8Array(cols * rows);
  for (let i = 0, c = 0; i < src.length; i += 4, c++) {
    face[c] = src[i + 3] > 127 ? 1 : 0;
  }

  // ── 3. the two strokes, grown in CELLS ────────────────────────────────────
  const halo = dilate(face, cols, rows, o.halo);
  // The keyline is dilated FIRST and shifted after, not the other way round:
  // shifting the source and then growing it would spread the shadow evenly
  // around the moved shape, which is the same symmetric ring again just in the
  // wrong place. Growing then translating keeps the band tight to the letter and
  // puts all of the extra weight on one side, which is what a cast shadow does.
  const keyGrown = dilate(face, cols, rows, o.keyline);
  const [odx, ody] = o.keylineOffset;
  const key =
    odx === 0 && ody === 0
      ? keyGrown
      : (() => {
          const out = new Uint8Array(cols * rows);
          for (let y = 0; y < rows; y++) {
            const sy = y - ody;
            if (sy < 0 || sy >= rows) continue;
            for (let x = 0; x < cols; x++) {
              const sx = x - odx;
              if (sx < 0 || sx >= cols) continue;
              out[y * cols + x] = keyGrown[sy * cols + sx];
            }
          }
          // The letter must still be fully enclosed: a pure translation leaves
          // the trailing edge bare, so the shadow reads as a shape sitting
          // BESIDE the letter rather than behind it. Union with the unshifted
          // grow so the keyline still rings the glyph, just heavier on one side.
          for (let i = 0; i < out.length; i++) if (keyGrown[i]) out[i] = 1;
          return out;
        })();

  // ── 4. pack and scale up with NO smoothing ────────────────────────────────
  // imageSmoothingEnabled = false is the entire reason this stays blocky: with
  // it on the browser bilinearly interpolates and hands back exactly the soft
  // ramp the effect is trying to avoid.
  const packLow = document.createElement("canvas");
  packLow.width = cols;
  packLow.height = rows;
  const px = packLow.getContext("2d")!;
  const img = px.createImageData(cols, rows);
  for (let c = 0; c < cols * rows; c++) {
    img.data[c * 4] = face[c] ? 255 : 0;
    img.data[c * 4 + 1] = halo[c] ? 255 : 0;
    img.data[c * 4 + 2] = key[c] ? 255 : 0;
    img.data[c * 4 + 3] = 255;
  }
  px.putImageData(img, 0, 0);

  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const ox = out.getContext("2d")!;
  ox.imageSmoothingEnabled = false;
  ox.drawImage(packLow, 0, 0, W, H);
  return out;
}
