"use client";

// The playground: the same poster, with the two numbers that ARE the effect
// exposed as sliders.
//
// THRESHOLD and RAMP are the whole thing, and they are worth understanding as a
// pair. The ramp is the blur baked into the mask, so it decides how much room
// the edge has to cross the cut — that is the BLOCK SIZE. The threshold decides
// WHERE along that ramp the cut lands, so it slides the staircase in and out and
// the letters gain or lose weight in whole blocks. Neither is a "style" control:
// between them they are the effect.
//
// Everything else here (word, colourway, texture) is dressing on top, which is
// why they sit below the two that matter.

import { useCallback, useEffect, useRef, useState } from "react";
import { GhostButton, PG_PANEL, PG_PREVIEW, Slider } from "../swirl/controls";
import { SectionLabel } from "../section-label";
import { Arcade } from "./engine";
import { COLORWAYS, DEFAULTS, FONT_CSS, FONT_WEIGHT } from "./params";

export function ArcadePlayground() {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Arcade | null>(null);

  const [word, setWord] = useState(DEFAULTS.word);
  const [threshold, setThreshold] = useState(DEFAULTS.threshold);
  const [cols, setCols] = useState(DEFAULTS.cols);
  const [keyline, setKeyline] = useState(DEFAULTS.keyline);
  const [shadow, setShadow] = useState(DEFAULTS.keylineOffset[0]);
  const [separation, setSeparation] = useState(DEFAULTS.separation);
  const [swim, setSwim] = useState(DEFAULTS.swim);
  const [pull, setPull] = useState(DEFAULTS.pull);
  const [magnetReach, setMagnetReach] = useState(DEFAULTS.magnetReach);
  const [texture, setTexture] = useState(DEFAULTS.texture);
  const [colorway, setColorway] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let engine: Arcade | null = null;
    let onScreen = false;
    let hidden = false;
    let started = false;

    const sync = () => {
      if (!engine || reduced) return;
      if (onScreen && !hidden) engine.start();
      else engine.stop();
    };

    const resolveFamily = () => {
      const probe = document.createElement("span");
      probe.style.cssText = "position:absolute;visibility:hidden";
      probe.style.fontFamily = FONT_CSS;
      probe.textContent = "Ag";
      document.body.appendChild(probe);
      const fam = getComputedStyle(probe)
        .fontFamily.split(",")[0]
        .replace(/["']/g, "")
        .trim();
      probe.remove();
      return fam;
    };

    const startEngine = (family?: string) => {
      if (started || !hostRef.current) return;
      started = true;
      engine = new Arcade(host, family ? `"${family}", sans-serif` : undefined);
      engineRef.current = engine;
      if (!engine.ok) return;
      // NO auto-cycling here. The gallery card runs itself because it has to be
      // alive in a grid; a playground that changes colour under you while you
      // are dragging a slider is fighting the person using it.
      if (reduced) engine.renderStill();
      else sync();
    };

    const hasFontApi =
      typeof document !== "undefined" && "fonts" in document && !!document.fonts;
    const raf = requestAnimationFrame(() => {
      if (!hostRef.current) return;
      const fam = hasFontApi ? resolveFamily() : "";
      if (hasFontApi && fam) {
        const to = window.setTimeout(() => startEngine(fam), 350);
        const go = () => {
          window.clearTimeout(to);
          startEngine(fam);
        };
        document.fonts.load(`${FONT_WEIGHT} 1em "${fam}"`).then(go, go);
      } else {
        startEngine();
      }
    });

    const io = new IntersectionObserver(
      (es) => {
        onScreen = es[0]?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0.2 },
    );
    io.observe(host);

    const onVis = () => {
      hidden = document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVis);

    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => engine?.resize(), 120);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(rt);
      engine?.destroy();
      engineRef.current = null;
    };
  }, []);

  // Push params down as they change. The engine decides for itself which of
  // these need a new mask (word and ramp do; the rest are pure uniforms).
  useEffect(() => {
    engineRef.current?.setParams({
      word,
      threshold,
      cols,
      keyline,
      keylineOffset: [shadow, shadow],
      texture,
      separation,
      swim,
      pull,
      magnetReach,
    });
  }, [word, threshold, cols, keyline, shadow, texture, separation, swim, pull, magnetReach]);

  const remix = useCallback(() => {
    const next = (colorway + 1) % COLORWAYS.length;
    setColorway(next);
    engineRef.current?.setColorway(next);
  }, [colorway]);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <SectionLabel action={<GhostButton onClick={remix}>Remix</GhostButton>}>
        Playground
      </SectionLabel>

      <div className="flex min-w-0 flex-col">
        <div ref={hostRef} className={`${PG_PREVIEW} relative aspect-video`} />

        <div className={PG_PANEL}>
          <label className="flex h-8 w-full items-center gap-3 rounded-lg border border-[var(--border-line)] bg-[var(--bg-page)] px-3 text-[12px] text-[var(--text-secondary)]">
            <span className="shrink-0">Word</span>
            <input
              value={word}
              onChange={(e) => setWord(e.target.value.slice(0, 14))}
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-right text-[var(--text-primary)] outline-none"
            />
          </label>

          <div className="flex h-8 w-full items-center rounded-lg border border-[var(--border-line)] bg-[var(--bg-page)] px-3 text-[12px] text-[var(--text-secondary)]">
            <span>Colourway</span>
            <span className="ml-auto text-[var(--text-primary)]">
              {COLORWAYS[colorway].name}
            </span>
          </div>

          {/* The two that matter. */}
          <Slider
            label="Threshold"
            value={threshold}
            min={0.25}
            max={0.85}
            step={0.005}
            onChange={setThreshold}
          />
          {/* The source's own grid is 150 cells across. */}
          <Slider
            label="Grid"
            value={cols}
            min={40}
            max={260}
            step={2}
            format={(v) => `${Math.round(v)} cells`}
            onChange={setCols}
          />
          <Slider
            label="Keyline"
            value={keyline}
            min={0}
            max={8}
            step={1}
            format={(v) => `${Math.round(v)} cells`}
            onChange={setKeyline}
          />
          <Slider
            label="Shadow"
            value={shadow}
            min={0}
            max={6}
            step={1}
            format={(v) => `${Math.round(v)} cells`}
            onChange={setShadow}
          />
          <Slider
            label="Magnet"
            value={magnetReach}
            min={0}
            max={7}
            step={1}
            format={(v) => `${Math.round(v)} cells`}
            onChange={setMagnetReach}
          />
          <Slider
            label="Pull"
            value={pull}
            min={0}
            max={0.04}
            step={0.002}
            format={(v) => v.toFixed(3)}
            onChange={setPull}
          />
          <Slider
            label="Swim"
            value={swim}
            min={0}
            max={2.5}
            step={0.1}
            onChange={setSwim}
          />
          <Slider
            label="Separation"
            value={separation}
            min={0}
            max={3}
            step={0.1}
            onChange={setSeparation}
          />
          <Slider
            label="Texture"
            value={texture}
            min={0}
            max={1.6}
            step={0.02}
            onChange={setTexture}
          />
        </div>
      </div>
    </div>
  );
}
13