"use client";

// The Vault card: an identity card that catches the light.
//
// The card tilts toward the pointer in real 3D and a foil sheet above the
// printed surface slides as it moves. The photo tile in the corner is treated
// as a different material: a hard two-colour duotone that FLIPS its polarity
// past a certain tilt, so the two surfaces never read as one sheet with a hole
// in it.
//
// DISPLAY ONLY — the ten materials, the sliders and the device-tilt opt-in all
// live in the playground on the detail page, because a card sitting in the
// gallery grid with its own control chrome looks nothing like the others.

import { useEffect, useRef } from "react";
import { onTransitionChange } from "../../lib/view-transition";
import {
  FOILS,
  Follow,
  Kick,
  Orientation,
  applyFoil,
  applyFrame,
  fromPointer,
} from "./engine";

export function HoloCard({
  bare = false,
  viewTransitionName,
}: {
  bare?: boolean;
  viewTransitionName?: string;
} = {}) {
  void bare;
  const hostRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // ONE MATERIAL, NOT A CAROUSEL. A card that changes colour on a timer has no
  // settled identity, and the slideshow competes with the tilt — which is the
  // actual effect. The other materials live in the playground, where switching
  // is something you choose to do.
  const foil = FOILS[0];

  // Material variables are written directly to the element rather than passed as
  // React style props: the frame loop already owns this element's style, and
  // mixing the two would have React clobber the loop's writes on every re-render.
  useEffect(() => {
    if (cardRef.current) applyFoil(cardRef.current, foil);
  }, [foil]);

  useEffect(() => {
    const host = hostRef.current;
    const card = cardRef.current;
    if (!host || !card) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Two followers at different weights. The card tracks quickly; the foil is
    // heavier and arrives a few frames later, so the surface catches up to the
    // card rather than moving with it. That lag is most of what separates this
    // from a gradient following a cursor.
    const tilt = new Follow(0.16);
    const sheet = new Follow(0.09);
    /** Fires once when the pointer leaves, carrying the speed you left at. */
    const kick = new Kick();
    /** Wall-clock seconds since mount, for the resting cycles. */
    const t0 = performance.now();

    let raf = 0;
    let running = false;
    let onScreen = false;
    let hidden = false;
    let inTransition = false;
    /** A slow wander when untouched, so the card is alive before you reach it. */
    let idle = 0;
    let touched = false;
    /** How far through the return-to-rest blend we are, 0..1. */
    let release = 1;
    /** Where the card was pointing when the pointer left — the start of that
     *  blend. Without it the drift's own phase is the start, and it is nowhere
     *  near where you were. */
    let handoff = { x: 0, y: 0 };
    /** The same blend on the way IN, 0..1. The pointer arrives somewhere far
     *  from wherever the card had drifted to, so taking it as the target
     *  immediately is a jump of most of the card's travel in one frame — the
     *  follower then covers 16% of that gap per frame, which is the teleport.
     *  This eases from the card's own pose into the pointer instead. */
    let grab = 1;
    /** Where the card was when the pointer arrived. */
    let grabFrom = { x: 0, y: 0 };
    /** The live pointer reading, held so the frame loop can blend toward it
     *  rather than the handler assigning it straight to the target. */
    let aim = { x: 0, y: 0 };

    const frame = () => {
      raf = 0;

      if (!touched) {
        // Two incommensurate rates, so the resting drift never visibly repeats.
        idle += 0.0042;
        const drift = {
          x: Math.sin(idle) * 0.28,
          y: Math.cos(idle * 0.73) * 0.2,
        };
        // EASE BACK INTO THE DRIFT, do not cut to it.
        //
        // The drift's phase keeps advancing while you are hovering, so at the
        // moment you leave it is somewhere unrelated to where the card is
        // pointing. Handing the target straight over teleports it, and the
        // follower then races to catch up — which is the snap.
        //
        // `release` ramps 0 -> 1 over about a second after the pointer goes, so
        // the target travels from where you left it to where the drift wants it
        // rather than jumping. Squared so it leaves gently and arrives with a
        // little more pace, which reads as the card relaxing rather than being
        // pulled.
        release = Math.min(1, release + 0.016);
        const k = release * release;
        tilt.target = {
          x: handoff.x + (drift.x - handoff.x) * k,
          y: handoff.y + (drift.y - handoff.y) * k,
        };
      }

      if (touched) {
        // Ease from where the card was into where the pointer is, for about the
        // same beat as the release. Squared, so it picks the card up gently
        // instead of snatching it.
        grab = Math.min(1, grab + 0.018);
        const k = grab * grab;
        tilt.target = {
          x: grabFrom.x + (aim.x - grabFrom.x) * k,
          y: grabFrom.y + (aim.y - grabFrom.y) * k,
        };
      }

      // The release overshoot rides ON TOP of the target rather than replacing
      // it, so the drift/pointer logic above stays untouched and the bounce
      // simply adds and decays away.
      const k = kick.step();
      if (k.x || k.y) {
        tilt.target = { x: tilt.target.x + k.x, y: tilt.target.y + k.y };
      }

      tilt.step();
      sheet.target = tilt.value;
      sheet.step();

      applyFrame(card, tilt.value, sheet.value, foil, foil, {
        speed: sheet.speed,
        velocity: sheet.velocity,
        time: (performance.now() - t0) / 1000,
      });

      // Keep running while the return blend is mid-flight: the followers can be
      // "settled" against a target that is itself still moving, and stopping
      // there would freeze the card partway home.
      if (
        running &&
        (!touched ||
          release < 1 ||
          grab < 1 ||
          kick.active ||
          !tilt.settled ||
          !sheet.settled)
      ) {
        raf = requestAnimationFrame(frame);
      }
    };

    const wake = () => {
      if (!running || raf) return;
      raf = requestAnimationFrame(frame);
    };

    const onPointer = (e: PointerEvent) => {
      if (reduced) return;
      aim = fromPointer(host.getBoundingClientRect(), e.clientX, e.clientY);
      if (!touched) {
        // FIRST contact: start the pick-up blend from the card's current pose.
        // Only on the transition — restarting it on every pointermove would
        // permanently lag the card behind the cursor.
        touched = true;
        grabFrom = { x: tilt.value.x, y: tilt.value.y };
        grab = 0;
      }
      // The blend only owns the untouched branch, but resetting it here means a
      // later leave always starts a fresh return rather than resuming an old one.
      release = 0;
      wake();
    };

    const onLeave = () => {
      touched = false;
      // Start the blend from the card's CURRENT pose, and restart it from zero
      // so a quick out-and-back-in never inherits a half-finished return.
      handoff = { x: tilt.value.x, y: tilt.value.y };
      release = 0;
      grab = 1;
      // Carry past a little on the axis you were pushing. Scaled by the speed at
      // release, so a flick throws it and setting it down does nothing.
      kick.fire(tilt.velocity);
      wake();
    };

    const sync = () => {
      const should = onScreen && !hidden && !inTransition && !reduced;
      if (should === running) return;
      running = should;
      if (should) wake();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(
      (es) => {
        onScreen = es.some((e) => e.isIntersecting);
        sync();
      },
      { rootMargin: "200px" },
    );
    io.observe(host);

    const onVis = () => {
      hidden = document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVis);
    const offTransition = onTransitionChange((a) => {
      inTransition = a;
      sync();
    });

    // DEVICE ORIENTATION, with no opt-in of its own.
    //
    // This card only ever renders in the Vault grid, where a permission button
    // would be chrome on a display-only tile — and on Android, where no
    // permission is required, events simply arrive and the card responds. On
    // iOS they never fire without a gesture, so the card falls back to its idle
    // drift there, which is the same thing it does on a desktop with no pointer
    // over it. The opt-in lives in the playground, where it is the subject.
    const orient = new Orientation();
    const onOrient = (e: DeviceOrientationEvent) => {
      if (reduced) return;
      const v = orient.read(e);
      if (!v) return;
      touched = true;
      tilt.target = v;
      wake();
    };

    host.addEventListener("pointermove", onPointer);
    host.addEventListener("pointerleave", onLeave);
    window.addEventListener("deviceorientation", onOrient);

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      offTransition();
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("deviceorientation", onOrient);
    };
    // `foil` is a module-level constant on this card (the display card shows one
    // material and never switches), so it is deliberately not a dependency:
    // listing it would let a re-render tear down and restart the rAF loop and
    // the observers for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={hostRef}
      data-canvas-card
      role="img"
      aria-label="An identity card reading Kamila, my girlfriend since May 2023, with a holographic foil surface that tilts and catches the light as the pointer moves across it"
      // Thins the third foil layer: this renders in a grid beside many other
      // live cards, and that layer is a material's finest detail.
      data-holo-lite=""
      className="relative flex aspect-[1344/620] w-full select-none items-center justify-center overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[linear-gradient(180deg,#f6f7f9_0%,#eceef2_100%)]"
      style={{
        perspective: "1100px",
        ...(viewTransitionName ? { viewTransitionName } : {}),
      }}
    >
      <HoloBody ref={cardRef} />
    </div>
  );
}

/**
 * The card itself: the printed body, the foil stack over it, and the photo tile.
 *
 * Shared with the playground, which mounts the identical tree and drives it with
 * the same variables — the only difference is where its numbers come from.
 */
export function HoloBody({
  ref,
  className = "h-[76%]",
}: {
  ref: React.Ref<HTMLDivElement>;
  className?: string;
}) {
  return (
    <div
      ref={ref}
      // A landscape identity card, ~1.55:1 — roughly a credit card's
      // proportion.
      className={`holo-card relative ${className}`}
      style={{ aspectRatio: "1.55" }}
    >
      {/* THE PRINTED SURFACE. Fixed colour — everything above is light landing
          on it, and the print itself never changes as the card moves. */}
      <div className="holo-body" />
      {/* The decoration, bought out of the tilt budget: barely there at rest,
          coming up smoothly and symmetrically as the card turns either way.
          Two passes — a dark one and a lit one, masked to opposite halves — so
          one side of the field is always pressed into the print while the other
          catches. */}
      <div className="holo-pattern" />
      <div className="holo-pattern--lit" />

      {/* The foil: three generic layers. What each paints, how fast it moves
          and how it composites all come from the material (see applyFoil) —
          these elements are just slots. */}
      <div className="holo-foil" />
      <div className="holo-foil--b" />
      <div className="holo-foil--c" />
      {/* Velocity, then the aligned-material flare, then the shared print grain
          that ties the card and the tile to the same medium. */}
      <div className="holo-smear" />
      <div className="holo-spot" />
      <div className="holo-noise" />
      <div className="holo-glare" />
      <div className="holo-sheen" />

      {/* THE CONTENT, above the foil. Type sitting UNDER the sheet gets eaten
          by it: the foil is light, and light lands on the print rather than on
          what is written over it. */}
      <div className="holo-content">
        <div className="holo-text">
          <p className="holo-name">Kamila</p>
          <p className="holo-since">my girlfriend since May 2023</p>
        </div>

        {/* THE TILE. A hard two-tone, deliberately plainer than the card: it
            gets a highlight but no rainbow and no bars, which is what keeps the
            two surfaces reading as different materials. */}
        <div className="holo-tile">
          {/* The same photograph twice — positive, then negative revealed
              through a travelling mask. See the CSS: a filter cannot invert
              part of an element, so the sweep needs two copies. */}
          <div className="holo-tile__photo" />
          <div className="holo-tile__photo--neg" />
          <div className="holo-tile__duo" />
          <div className="holo-tile__tone" />
          <div className="holo-tile__foil" />
          <div className="holo-tile__grain" />
          <div className="holo-tile__wear" />
          <div className="holo-tile__vignette" />
          <div className="holo-tile__gloss" />
        </div>
      </div>
    </div>
  );
}
