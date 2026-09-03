"use client";

// Arcade pixel type — the engine.
//
// Framework-free WebGL1 class: owns the context, the mask upload, the rAF loop
// and the eased pointer. React never touches a uniform. Same shape as the chrome
// and chroma engines, and forked from their lifecycle: idle-deferred CPU build,
// pause offscreen, reveal-on-first-paint so the card never flashes an empty
// canvas.

import { mediaUrl } from "../../lib/video-sources";
import { ARCADE_FRAG, FULL_VERT } from "./shaders";
import { makeArcadeField } from "./text-mask";
import {
  COLORWAYS,
  DEFAULTS,
  FONT_CSS,
  LEVELS_IN,
  VIBRANCE,
  type ArcadeParams,
  type Colorway,
} from "./params";
import {
  SEQUENCE,
  cellsAt,
  nextPhase,
  phaseMs,
  type Phase,
} from "./cycle";

/** Flatten a colourway to 12 floats so two of them can be lerped as plain
 *  numbers rather than re-parsed every frame. */
function toFloats(c: Colorway): number[] {
  return [...c.ground, ...c.ink, ...c.paper, ...c.fringe];
}

const UNIFORMS = [
  "uField", "uResolution", "uAspect", "uTime",
  "uThreshold", "uTexture", "uMoire", "uGrain", "uDust", "uSeparation", "uCursor", "uCursorOn", "uSwim", "uParallax", "uPull",
  "uMoireScale", "uGrainScale", "uDustScale",
  "uGround", "uInk", "uPaper", "uFringe",
  "uLevels", "uVibrance",
] as const;

export class Arcade {
  private host: HTMLElement;
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private prog: WebGLProgram | null = null;
  private loc: Record<string, WebGLUniformLocation | null> = {};
  private quad: WebGLBuffer | null = null;
  private tex: WebGLTexture | null = null;

  /** The two real texture plates lifted out of the PSD. */
  private moire: WebGLTexture | null = null;
  private grain: WebGLTexture | null = null;
  private dust: WebGLTexture | null = null;

  readonly params: ArcadeParams = { ...DEFAULTS };

  private w = 0;
  private h = 0;
  private dpr = 1;
  private fontFamily = `${FONT_CSS}, sans-serif`;

  /** The live colourway.
   *
   *  NOT crossfaded any more. The resolution collapse IS the transition, and a
   *  smooth colour fade running at the same time is a second transition fighting
   *  the first — you end up watching a wash instead of a collapse. The colour now
   *  switches instantly at the coarsest frame, where the field is a handful of
   *  huge squares and there is nothing legible for the change to interrupt. */
  private cur = toFloats(COLORWAYS[0]);

  /** The autonomous resolution cycle. Only the card runs it; the playground
   *  stays wherever you put the sliders. */
  /** Pointer in uv, its eased presence, and the eased shadow offset.
   *
   *  THE SHADOW IS EASED AS A FLOAT AND USED AS AN INTEGER. The keyline lives on
   *  the lattice, so its offset has to be whole cells or the shadow lands half a
   *  block out of register and the whole point of the grid is lost. But snapping
   *  the RAW pointer to cells makes the shadow jump the instant you cross a cell
   *  boundary, which reads as a glitch. Easing a float and rounding only at the
   *  moment of use gives a shadow that moves in clean whole-cell steps at a pace
   *  the eye reads as weight. */
  private cx = 0.5;
  private cy = 0.5;
  private on = 0;
  private onTarget = 0;
  private shX = 0;
  private shY = 0;

  private cycling = false;
  private phase: Phase = "hold";
  private phaseT = 0;
  private idx = 0;
  private wordIdx = 0;
  /** The cell count currently uploaded, so the frame loop only rebuilds the mask
   *  when the QUANTISED value actually changes. Tweening 150 -> 16 continuously
   *  would rebuild ~60x a second for maybe 40 visually distinct steps. */
  private builtCols = -1;
  /** The keyline offset actually baked into the current mask, in whole cells. */
  private liveShadow: [number, number] = [0, 0];

  private raf = 0;
  private running = false;
  private awake = false;
  private painted = false;
  private destroyed = false;
  private t0 = performance.now();
  private last = 0;

  private builtW = 0;
  private builtH = 0;
  private builtWord = "";
  private builtKey = "";
  private builtFont = "";
  private buildScheduled = 0;

  ok = false;

  constructor(host: HTMLElement, fontFamily?: string) {
    this.host = host;
    if (fontFamily) this.fontFamily = fontFamily;
    this.canvas = document.createElement("canvas");
    Object.assign(this.canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
      opacity: "0",
    });
    host.appendChild(this.canvas);

    const gl = this.canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;
    this.gl = gl;

    try {
      this.prog = this.build(FULL_VERT, ARCADE_FRAG);
    } catch {
      this.gl = null;
      return;
    }
    for (const u of UNIFORMS) {
      this.loc[u] = gl.getUniformLocation(this.prog, u);
    }

    this.quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(this.prog, "aPosition");
    gl.useProgram(this.prog);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // The two real PSD plates. Served from /public in dev and R2 in prod via
    // mediaUrl(), the same as the grunge scans and the holo photo.
    this.loadPlate(mediaUrl("/vault/arcade-moire.webp"), "moire");
    this.loadPlate(mediaUrl("/vault/arcade-grain.webp"), "grain");
    this.loadPlate(mediaUrl("/vault/arcade-dust.webp"), "dust");

    this.resize();
    void this.buildFieldNow();

    this.canvas.addEventListener("pointermove", this.onMove);
    this.canvas.addEventListener("pointerleave", this.onLeave);

    this.ok = true;
  }

  /** Load one of the PSD plates and upload it as a REPEATing texture.
   *
   *  gl.REPEAT is the whole reason these are power-of-two-friendly and sampled
   *  by scale rather than stretched to the card: tiling preserves the moire's
   *  measured pitch, where fitting the image to the frame would change its
   *  frequency and stop it reading as interference. */
  private loadPlate(url: string, onto: "moire" | "grain" | "dust") {
    const gl = this.gl;
    if (!gl) return;
    const img = new Image();
    // R2 is a different origin, and an un-CORS'd image taints the context the
    // moment it is uploaded as a texture.
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!this.gl || this.destroyed) return;
      // WEBGL1 REQUIRES POWER-OF-TWO FOR gl.REPEAT, and this is the trap that
      // silently blanked the whole surface once already: a NPOT texture with
      // REPEAT wrapping is INCOMPLETE, so texture2D() returns solid black with
      // no warning, no console error and no visible failure — the card just
      // renders a flat ground and looks like the texture "did not load".
      // The plates are exported 512x512 for exactly this reason; fall back to
      // CLAMP if one ever is not, so a bad asset degrades instead of vanishing.
      const pot = (n: number) => (n & (n - 1)) === 0;
      const repeatOk = pot(img.width) && pot(img.height);
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      const wrap = repeatOk ? gl.REPEAT : gl.CLAMP_TO_EDGE;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      this[onto] = t;
      // The plates arrive after the first paint, so redraw once they land or the
      // card sits there flat until something else happens to wake it.
      if (!this.running) this.render();
    };
    img.src = url;
  }

  private build(vs: string, fs: string): WebGLProgram {
    const gl = this.gl!;
    const c = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(sh) || "compile failed");
      }
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, c(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, c(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || "link failed");
    }
    return prog;
  }

  private onMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    this.cx = (e.clientX - r.left) / r.width;
    this.cy = 1 - (e.clientY - r.top) / r.height; // uv origin is bottom-left
    this.onTarget = 1;
    this.wake();
  };

  private onLeave = () => {
    this.onTarget = 0;
    this.wake();
  };

  private wake() {
    if (this.awake && !this.running) this.start();
    else if (!this.running) this.render();
  }

  setParams(p: Partial<ArcadeParams>) {
    // The mask bakes the grid, the strokes and the slant, so any of those four
    // needs a rebuild; everything else is a pure uniform change.
    const rebuild =
      (p.word !== undefined && p.word !== this.params.word) ||
      (p.cols !== undefined && p.cols !== this.params.cols) ||
      (p.halo !== undefined && p.halo !== this.params.halo) ||
      (p.keyline !== undefined && p.keyline !== this.params.keyline) ||
      (p.keylineOffset !== undefined &&
        p.keylineOffset.join() !== this.params.keylineOffset.join()) ||
      (p.italic !== undefined && p.italic !== this.params.italic);
    Object.assign(this.params, p);
    if (p.colorway !== undefined) this.setColorway(p.colorway);
    // Only the word and the RAMP need a new mask — the ramp is baked into the
    // blur, so it is the one slider that cannot be a pure uniform change.
    if (rebuild) this.scheduleBuild();
    this.wake();
  }

  /** Switch colourway. Instant — see the note on `cur`. */
  setColorway(i: number) {
    const n = ((i % COLORWAYS.length) + COLORWAYS.length) % COLORWAYS.length;
    this.idx = n;
    this.params.colorway = n;
    this.cur = toFloats(COLORWAYS[n]);
    this.wake();
  }

  /** The gallery card runs the resolution cycle; the playground does not. */
  setCycling(on: boolean) {
    this.cycling = on;
    this.phase = "hold";
    this.phaseT = 0;
  }

  setFont(family: string) {
    if (family === this.fontFamily) return;
    this.fontFamily = family;
    this.scheduleBuild();
  }

  resize() {
    const r = this.host.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = r.width;
    this.h = r.height;
    const cw = Math.max(1, Math.round(this.w * this.dpr));
    const ch = Math.max(1, Math.round(this.h * this.dpr));
    if (this.canvas.width !== cw || this.canvas.height !== ch) {
      this.canvas.width = cw;
      this.canvas.height = ch;
      this.gl?.viewport(0, 0, cw, ch);
      this.scheduleBuild();
    }
  }

  /** Everything the mask depends on, as one comparable string. */
  private paramKey(): string {
    const p = this.params;
    const sh = p.magnet ? this.liveShadow : p.keylineOffset;
    return `${p.word}|${p.cols}|${p.halo}|${p.keyline}|${sh.join(",")}|${p.italic}`;
  }

  private maskSize(): [number, number] {
    const MAX_W = 1600;
    const mw = Math.max(2, Math.min(MAX_W, Math.round(this.w * this.dpr)));
    const mh = Math.max(2, Math.round(mw * (this.h / Math.max(1, this.w))));
    return [mw, mh];
  }

  private scheduleBuild() {
    if (!this.gl || this.destroyed) return;
    const [mw, mh] = this.maskSize();
    if (
      mw === this.builtW &&
      mh === this.builtH &&
      this.params.word === this.builtWord &&
      this.builtKey === this.paramKey() &&
      this.fontFamily === this.builtFont
    ) {
      return;
    }
    if (this.buildScheduled) return;
    const run = () => {
      this.buildScheduled = 0;
      void this.buildFieldNow();
    };
    const ric = (
      window as unknown as {
        requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    this.buildScheduled = ric ? ric(run, { timeout: 200 }) : window.setTimeout(run, 0);
  }

  /** Rebuild + upload RIGHT NOW, skipping the idle defer and the dirty check.
   *
   *  The animation drives `cols` frame by frame, so it needs the mask to land in
   *  the same frame it asked for it. scheduleBuild() is still the right path for
   *  word/font/resize changes, where the work is genuinely deferrable and
   *  arriving a beat late costs nothing. */
  buildSync() {
    const gl = this.gl;
    if (!gl || this.destroyed) return;
    const [mw, mh] = this.maskSize();
    this.uploadMask(mw, mh);
  }

  /** Rasterise at the current params and hand the result to GL. */
  private uploadMask(mw: number, mh: number) {
    const gl = this.gl;
    if (!gl || this.destroyed) return;
    this.builtW = mw;
    this.builtH = mh;
    this.builtWord = this.params.word;
    this.builtKey = this.paramKey();
    this.builtFont = this.fontFamily;

    const art = makeArcadeField({
      word: this.params.word,
      cols: this.params.cols,
      halo: this.params.halo,
      keyline: this.params.keyline,
      keylineOffset: this.params.magnet
        ? this.liveShadow
        : this.params.keylineOffset,
      italic: this.params.italic,
      w: mw,
      h: mh,
      fontFamily: this.fontFamily,
    });
    if (!this.tex) this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, art);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }

  private async buildFieldNow() {
    const gl = this.gl;
    if (!gl || this.destroyed) return;
    if (this.buildScheduled) {
      const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void })
        .cancelIdleCallback;
      if (cic) cic(this.buildScheduled);
      else window.clearTimeout(this.buildScheduled);
      this.buildScheduled = 0;
    }
    const [mw, mh] = this.maskSize();
    this.uploadMask(mw, mh);
    if (!this.running) this.render();
  }

  start() {
    if (!this.ok) return;
    this.awake = true;
    if (this.running) return;
    this.running = true;
    this.last = 0;
    this.resize();
    const loop = (now: number) => {
      if (!this.running) return;
      this.frame(now);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.awake = false;
    this.pause();
  }

  private pause() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private frame(now: number) {
    const dt = this.last ? Math.min(64, now - this.last) : 16;
    this.last = now;

    this.on += (this.onTarget - this.on) * 0.12;
    this.stepMagnet();

    if (this.cycling) this.stepCycle(dt);

    this.render();
  }

  /**
   * C2 — THE MAGNETIC KEYLINE.
   *
   * The drop shadow follows the pointer, so the light source appears to track
   * your hand and the letters read as lifting off the poster. Only the shadow
   * moves: the face and the halo stay welded to the lattice, which is what keeps
   * this feeling like a light moving rather than the type sliding around.
   *
   * The offset is INVERTED — the shadow falls away from the cursor, because that
   * is where a light in front of the card would throw it.
   */
  private stepMagnet() {
    const p = this.params;
    if (!p.magnet) return;
    const reach = p.keylineOffset[0] + p.magnetReach;
    const tx = -(this.cx - 0.5) * 2 * reach * this.on;
    const ty = (this.cy - 0.5) * 2 * reach * this.on;
    this.shX += (tx - this.shX) * 0.14;
    this.shY += (ty - this.shY) * 0.14;

    // Round to whole cells only at the point of use, and only rebuild when the
    // integer actually changes — otherwise this would rasterise every frame to
    // move the shadow by a fraction of a block nobody can see.
    const base = p.keylineOffset;
    const nx = Math.round(base[0] + this.shX);
    const ny = Math.round(base[1] + this.shY);
    if (nx !== this.liveShadow[0] || ny !== this.liveShadow[1]) {
      this.liveShadow = [nx, ny];
      this.buildSync();
    }
  }

  /** Advance the resolution cycle and rebuild the mask when the grid changes. */
  private stepCycle(dt: number) {
    this.phaseT += dt;
    const dur = phaseMs(this.phase);

    if (this.phaseT >= dur) {
      this.phaseT = 0;
      const prev = this.phase;
      this.phase = nextPhase(this.phase);
      // THE SWAP HAPPENS AT THE BOTTOM. Between collapse and resolve the field
      // is ~16 cells across and completely illegible, so changing the word and
      // the colour here costs nothing visually — the new word simply resolves
      // out of the same squares the old one dissolved into.
      if (prev === "collapse") {
        this.wordIdx = (this.wordIdx + 1) % SEQUENCE.length;
        this.params.word = SEQUENCE[this.wordIdx];
        this.setColorway(this.idx + 1);
      }
    }

    const t = Math.min(1, this.phaseT / phaseMs(this.phase));
    const cols = cellsAt(this.phase, t);
    if (cols !== this.builtCols) {
      this.builtCols = cols;
      this.params.cols = cols;
      this.buildSync();
    }
  }

  renderStill() {
    this.resize();
    void this.buildFieldNow();

    this.canvas.addEventListener("pointermove", this.onMove);
    this.canvas.addEventListener("pointerleave", this.onLeave);
    this.render();
  }

  private render() {
    const gl = this.gl;
    if (!gl || !this.prog || !this.tex) return;
    const p = this.params;

    gl.useProgram(this.prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform1i(this.loc.uField, 0);
    gl.uniform2f(this.loc.uResolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.loc.uAspect, this.w / Math.max(1, this.h));
    gl.uniform1f(this.loc.uTime, (performance.now() - this.t0) / 1000);

    gl.uniform1f(this.loc.uThreshold, p.threshold);

    // ── PLATE SCALE ───────────────────────────────────────────────────────
    // How big the printed surface reads, and the number that has been wrong in
    // both directions already.
    //
    // Tiling the plate 7.5x across the card crushed its ~28px interference pitch
    // to ~1.1px on screen — sub-pixel, so it aliased to flat grey and the whole
    // poster looked like static. Showing it at 1:1 fixed that but left the
    // pattern fine enough to need looking for.
    //
    // The moire plate is now a 1024px crop taken at 1:1 from the source, so its
    // pitch is native. Showing ONE tile across a ~1344px card magnifies it only
    // ~1.3x and lands the pitch near 36px — big enough to read across the room
    // without the texel softness that magnifying a small plate would bring.
    const MOIRE_TILES = 1.0;
    const DUST_TILES = 0.85;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.moire);
    gl.uniform1i(this.loc.uMoire, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.grain);
    gl.uniform1i(this.loc.uGrain, 2);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.dust);
    gl.uniform1i(this.loc.uDust, 3);
    // The plates are SQUARE, so scaling x by the aspect keeps them unstretched
    // on a 1344x620 card — a stretched moire shears into stripes and stops
    // reading as interference at all.
    const aspect = this.w / Math.max(1, this.h);
    gl.uniform2f(this.loc.uMoireScale, MOIRE_TILES * aspect, MOIRE_TILES);
    // The grain stays FINE. It is per-pixel noise, so unlike the moire it gains
    // nothing from being enlarged — blown up it stops being grain and becomes
    // blotches. Tiled hard so it keeps a tight, printed tooth.
    gl.uniform2f(this.loc.uGrainScale, aspect * 2.6, 2.6);
    gl.uniform2f(this.loc.uDustScale, DUST_TILES * aspect, DUST_TILES);

    gl.uniform1f(this.loc.uTexture, p.texture);
    gl.uniform1f(this.loc.uSeparation, p.separation);
    gl.uniform2f(this.loc.uCursor, this.cx, this.cy);
    gl.uniform1f(this.loc.uCursorOn, this.on);
    gl.uniform1f(this.loc.uSwim, p.swim);
    gl.uniform1f(this.loc.uParallax, p.parallax);
    gl.uniform1f(this.loc.uPull, p.pull);

    const c = this.cur;
    gl.uniform3f(this.loc.uGround, c[0], c[1], c[2]);
    gl.uniform3f(this.loc.uInk, c[3], c[4], c[5]);
    gl.uniform3f(this.loc.uPaper, c[6], c[7], c[8]);
    gl.uniform3f(this.loc.uFringe, c[9], c[10], c[11]);


    gl.uniform2f(this.loc.uLevels, LEVELS_IN[0], LEVELS_IN[1]);
    gl.uniform1f(this.loc.uVibrance, VIBRANCE);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!this.painted) {
      this.painted = true;
      this.canvas.style.opacity = "1";
    }

    // Idle out once nothing is left to animate. The card is a static poster
    // between colourway changes, so there is no reason to hold a rAF open.
    // Idle out once nothing is left to animate. While cycling there always is,
    // so this only fires for a card that is parked and not being hovered.
    if (
      !this.awake &&
      !this.cycling &&
      Math.abs(this.on - this.onTarget) < 0.002
    ) {
      this.pause();
    }
  }

  destroy() {
    this.destroyed = true;
    if (this.buildScheduled) {
      const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void })
        .cancelIdleCallback;
      if (cic) cic(this.buildScheduled);
      else window.clearTimeout(this.buildScheduled);
      this.buildScheduled = 0;
    }
    this.stop();
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerleave", this.onLeave);
    const gl = this.gl;
    if (gl) {
      if (this.tex) gl.deleteTexture(this.tex);
      if (this.moire) gl.deleteTexture(this.moire);
      if (this.grain) gl.deleteTexture(this.grain);
      if (this.dust) gl.deleteTexture(this.dust);
      if (this.quad) gl.deleteBuffer(this.quad);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
    this.canvas.remove();
  }
}
