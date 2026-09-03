"use client";

import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "./arlan-vault/lib/video-sources";
import { GhostReveal } from "./arlan/GhostReveal";
import { TyperLine } from "./arlan/TyperLine";
import { ArcadePlayground } from "./arlan-vault/code/arcade-pixel/playground";
import { HoverVideoButton } from "./arlan-vault/code/amo/HoverVideoButton";
import { ChromaGlowPlayground } from "./arlan-vault/code/chroma-glow/playground";
import { ColorDepthPlay } from "./arlan-vault/code/color-depth/ColorDepthPlay";
import { DiaGradient } from "./arlan-vault/code/dia-gradient/DiaGradient";
import { EmbossPlayground_ as EmbossPlay } from "./arlan-vault/code/emboss/playground";
import { SmearCard } from "./arlan-vault/code/fade-motion/SmearCard";
import { HoloCard } from "./arlan-vault/code/holo/HoloCard";
import { KineticACard } from "./arlan-vault/code/kinetic-typography/KineticACard";
import { LiquidPlayground } from "./arlan-vault/code/liquid-ui/playground";
import { SwirlPlayground } from "./arlan-vault/code/midjourney/playground";
import { PixelBrushCard } from "./arlan-vault/code/pixel-brushes/PixelBrushCard";
import { RansomNotePlayground } from "./arlan-vault/code/ransom-note/playground";
import { SymbolsEffect } from "./arlan-vault/code/sandbox/SymbolsEffect";
import { SquirclePlayground } from "./arlan-vault/code/squircle/playground";
import { FigmaFrame } from "./arlan-vault/code/vector-editor/FigmaFrame";
import { parsePath } from "./arlan-vault/code/vector-editor/parse";
import { VectorEditor } from "./arlan-vault/code/vector-editor/VectorEditor";
import { ButtonsPlay } from "./bakai-lab/Buttons";
import {
  Athlos,
  DragButton,
  Loom,
  QrReveal,
  RingLetters,
} from "./bakai-lab/canvas";
import {
  Accounts,
  Charts,
  Dropdown,
  FoheBoard,
  Icons,
  Island,
  Loader,
  Login,
  MemberDialog,
  OymoScan,
  Pipeline,
  SidebarStudy,
  SpinaList,
} from "./bakai-lab/chrome";
import { FadeGrid, OpGrid, WarpGrid, WaveGrid } from "./bakai-lab/grids";
import { Liquid } from "./jakub/gooey";
import { useReducedMotion } from "./jakub/gooey/hooks";
import { MetalFx } from "./jakub/metal";
import { ThinkingOrb } from "./jakub/orbs/ThinkingOrb";
import type { OrbState } from "./jakub/orbs/types";
import type { PlayKind } from "@/content/vault";

const ORB_STATES: OrbState[] = [
  "working",
  "searching",
  "solving",
  "listening",
  "connecting",
  "weaving",
  "composing",
  "breathing",
  "shaping",
];

const SAMPLE_PATH =
  "M 40 90 C 40 40 160 40 160 90 C 160 140 40 140 40 90 Z";

function TyperPlay() {
  return (
    <p className="name min-h-[2.5rem] text-[1.75rem] leading-none">
      <TyperLine text="Yousef Turk" />
    </p>
  );
}

function GhostyPlay() {
  return (
    <GhostReveal duration={900}>
      <div className="h-28 w-44 rounded-[1.4rem] bg-[#ddd8cc]" />
    </GhostReveal>
  );
}

function OrbPlay() {
  const [state, setState] = useState<OrbState>("breathing");
  return (
    <div className="flex flex-col gap-5">
      <ThinkingOrb state={state} size={64} theme="auto" />
      <div className="flex max-w-[28rem] flex-wrap gap-x-3 gap-y-1">
        {ORB_STATES.map((verb) => (
          <button
            key={verb}
            type="button"
            className="chip-plain"
            data-on={state === verb ? "true" : undefined}
            onClick={() => setState(verb)}
          >
            {verb}
          </button>
        ))}
      </div>
    </div>
  );
}

function GooeyPlay() {
  const [hot, setHot] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const morph = reduced
    ? undefined
    : { shape: true as const, bounce: 0.18, speed: 1.2, contentBlur: 0 };
  const labels = ["one", "two", "three"];

  return (
    <Liquid
      blur={7}
      contrast={18}
      fill="var(--goo)"
      filterPadding={16}
      className="nav-liquid"
    >
      {labels.map((label) => (
        <Liquid.Item key={label} observe morph={morph}>
          <button
            type="button"
            className="pill"
            data-hot={hot === label ? "true" : undefined}
            onPointerEnter={() => setHot(label)}
            onPointerLeave={() => setHot(null)}
            onFocus={() => setHot(label)}
            onBlur={() => setHot(null)}
          >
            {label}
          </button>
        </Liquid.Item>
      ))}
    </Liquid>
  );
}

function MetalPlay() {
  const [hit, setHit] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <MetalFx variant="button" preset="silver" theme="auto" strength={0.62}>
        <button type="button" className="chip" onClick={() => setHit("silver")}>
          {hit === "silver" ? "Pressed" : "Silver"}
        </button>
      </MetalFx>
      <MetalFx variant="button" preset="gold" theme="auto" strength={0.62}>
        <button type="button" className="chip" onClick={() => setHit("gold")}>
          {hit === "gold" ? "Pressed" : "Gold"}
        </button>
      </MetalFx>
    </div>
  );
}

function ScrollPlay() {
  return (
    <p className="max-w-[28rem] text-[0.95rem] text-mute">
      On a desktop with a mouse, look at the right edge of this page. Idle
      it&apos;s a chevron. Scroll and it becomes dots.
    </p>
  );
}

function DiaPlay() {
  return (
    <div className="relative h-48 overflow-hidden rounded-xl bg-[#1b1b1b]">
      <div className="absolute inset-x-0 bottom-0 h-full">
        <DiaGradient />
      </div>
    </div>
  );
}

function VectorPlay() {
  const [path, setPath] = useState(() => parsePath(SAMPLE_PATH));
  return (
    <FigmaFrame>
      <VectorEditor
        path={path}
        onChange={setPath}
        viewBox={[0, 0, 200, 180]}
        width={320}
        height={288}
      />
    </FigmaFrame>
  );
}

function SymbolsPlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fx = new SymbolsEffect(canvas, {
      cell: 14,
      bandColors: ["#1b1b1b", "#4a4a4a", "#8a8a8a", "#d0d0d0"],
      bandStops: [0, 0.25, 0.5, 0.75, 1],
      bandGlyphs: [1, 2, 3, 4],
    });
    fx.resize();
    fx.setImage(mediaUrl("/holo/kamila.webp"));
    const ro = new ResizeObserver(() => fx.resize());
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      fx.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="h-56 w-full rounded-xl bg-paper" />;
}

export function Playground({ kind }: { kind: PlayKind }) {
  switch (kind) {
    case "typer":
      return <TyperPlay />;
    case "ghosty":
      return <GhostyPlay />;
    case "squircle":
      return <SquirclePlayground />;
    case "arcade-pixel":
      return <ArcadePlayground />;
    case "holo":
      return <HoloCard />;
    case "pixel-brushes":
      return <PixelBrushCard />;
    case "fade-motion":
      return <SmearCard />;
    case "liquid-ui":
      return <LiquidPlayground />;
    case "kinetic-typography":
      return <KineticACard />;
    case "ransom-note":
      return <RansomNotePlayground />;
    case "chroma-glow":
      return <ChromaGlowPlayground />;
    case "emboss":
      return <EmbossPlay />;
    case "color-depth":
      return <ColorDepthPlay />;
    case "sandbox":
      return <SymbolsPlay />;
    case "dia-gradient":
      return <DiaPlay />;
    case "vector-editor":
      return <VectorPlay />;
    case "amo":
      return (
        <HoverVideoButton
          label="amo"
          video="/vault/amo"
          reverseVideo="/vault/amo-reverse"
        />
      );
    case "midjourney":
      return <SwirlPlayground />;
    case "orb":
      return <OrbPlay />;
    case "gooey":
      return <GooeyPlay />;
    case "metal":
      return <MetalPlay />;
    case "scrollbar":
      return <ScrollPlay />;
    case "glossy":
      return <ButtonsPlay kind="glossy" />;
    case "glow":
      return <ButtonsPlay kind="glow" />;
    case "bevel":
      return <ButtonsPlay kind="bevel" />;
    case "flat":
      return <ButtonsPlay kind="flat" />;
    case "buttons":
      return <ButtonsPlay />;
    case "qr":
      return <QrReveal />;
    case "athlos":
      return <Athlos />;
    case "loom":
      return <Loom />;
    case "fade-grid":
      return <FadeGrid />;
    case "warp-grid":
      return <WarpGrid />;
    case "ring-letters":
      return <RingLetters />;
    case "acme-login":
      return <Login />;
    case "wave-grid":
      return <WaveGrid />;
    case "drag-button":
      return <DragButton />;
    case "op-grid":
      return <OpGrid />;
    case "island":
      return <Island />;
    case "loader":
      return <Loader />;
    case "accounts":
      return <Accounts />;
    case "pipeline":
      return <Pipeline />;
    case "kanban":
      return <Pipeline view="kanban" />;
    case "list":
      return <Pipeline view="list" />;
    case "icons":
      return <Icons />;
    case "charts":
      return <Charts />;
    case "pie":
      return <Charts kind="pie" />;
    case "bar":
      return <Charts kind="bar" />;
    case "line":
      return <Charts kind="line" />;
    case "dropdown":
      return <Dropdown />;
    case "dialog":
      return <MemberDialog />;
    case "sidebars":
      return <SidebarStudy />;
    case "fohe":
      return <FoheBoard />;
    case "oymo":
      return <OymoScan />;
    case "spina":
      return <SpinaList />;
  }
}
