"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { scrollPageTo } from "@/lib/smooth-scroll";
import { bakedTransitions, lerp } from "./transitions";
import {
  getPoses,
  getTargetForState,
  POSE_ORDER,
  type Geometry,
  type LineEndpoints,
  type ScrollbarState,
} from "./poses";
import "./Scrollbar.css";

type Rgb = readonly [r: number, g: number, b: number];

const settings = {
  arrowLength: 28,
  wingSpread: 8,
  bobAmplitude: 3,
  bobPeriod: 2,
  arrowHitPadding: 10,
  lineLength: 400,
  maxExtension: 50,
  extensionFalloff: 0.6,
  colorFalloff: 0.3,
  smoothingTau: 0.05,
  trackingHitPadding: 10,
  dotColor: "#6d7173",
  hoverColor: "#1f7a4d",
  strokeWidth: 3,
  dotCount: 40,
};

const parseHexColor = (hex: string): Rgb => {
  const digits = hex.trim().slice(1);
  const full =
    digits.length === 3 ? [...digits].map((d) => d + d).join("") : digits;
  const n = parseInt(full, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
};

const mixColors = (from: Rgb, to: Rgb, t: number) =>
  `rgb(${Math.round(lerp(from[0], to[0], t))}, ${Math.round(
    lerp(from[1], to[1], t),
  )}, ${Math.round(lerp(from[2], to[2], t))})`;

const getStateForScroll = (scrollY: number): ScrollbarState =>
  scrollY > 0 ? "tracking" : "idle";

const getScrollFraction = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return maxScroll > 0
    ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
    : 0;
};

const getFocusDot = (dotCount: number) =>
  Math.round(getScrollFraction() * (dotCount - 1));

const getScrollPositionForDot = (dot: number, dotCount: number) => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const fraction = dotCount > 1 ? dot / (dotCount - 1) : 1;
  return fraction * maxScroll;
};

const scrollToDot = (dot: number, dotCount: number) => {
  scrollPageTo(getScrollPositionForDot(dot, dotCount));
};

const scrollDownOneViewport = () => {
  scrollPageTo(window.scrollY + window.innerHeight);
};

interface AnimState {
  current: number;
  target: number;
  rafId: number | null;
  lastTime: number;
  state: ScrollbarState;
}

export function CoolerScrollbar() {
  const svgRef = useRef<SVGSVGElement>(null);
  const leftWingRef = useRef<SVGLineElement>(null);
  const rightWingRef = useRef<SVGLineElement>(null);
  const pieceRefs = useRef<(SVGLineElement | null)[]>([]);
  const hitRefs = useRef<(SVGRectElement | null)[]>([]);
  const arrowHitRef = useRef<SVGRectElement>(null);

  const anim = useRef<AnimState>({
    current: 0,
    target: 0,
    rafId: null,
    lastTime: 0,
    state: "idle",
  });
  const didEnter = useRef(false);
  const bobTime = useRef(0);

  const { dotCount } = settings;

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const leftWing = leftWingRef.current;
    const rightWing = rightWingRef.current;
    const pieces = pieceRefs.current
      .slice(0, dotCount)
      .filter((el): el is SVGLineElement => el !== null);
    const hits = hitRefs.current
      .slice(0, dotCount)
      .filter((h): h is SVGRectElement => h !== null);
    const arrowHit = arrowHitRef.current;
    if (
      !svg ||
      !leftWing ||
      !rightWing ||
      !arrowHit ||
      pieces.length < dotCount ||
      hits.length < dotCount
    )
      return;

    const a = anim.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canHover = window.matchMedia("(hover: hover)");
    const transitions = bakedTransitions;

    const readThemeColors = () => {
      const cs = getComputedStyle(document.documentElement);
      return {
        dot: parseHexColor(
          cs.getPropertyValue("--scroll-dot").trim() || settings.dotColor,
        ),
        hover: parseHexColor(
          cs.getPropertyValue("--live").trim() || settings.hoverColor,
        ),
      };
    };

    const geometry: Geometry = {
      arrowLength: settings.arrowLength,
      wingSpread: settings.wingSpread,
      lineLength: settings.lineLength,
      dotCount,
    };
    let poses = getPoses(svg.getBoundingClientRect(), geometry);

    const getExtensionLength = (dot: number, focusDot: number) =>
      settings.maxExtension *
      settings.extensionFalloff ** Math.abs(dot - focusDot);

    const placeHitAreas = () => {
      const spacing = settings.lineLength / dotCount;
      hits.forEach((el, i) => {
        const [x, y1, , y2] = poses.split.pieces[i];
        el.setAttribute(
          "x",
          String(x - settings.maxExtension - settings.trackingHitPadding),
        );
        el.setAttribute("y", String((y1 + y2) / 2 - spacing / 2));
        el.setAttribute(
          "width",
          String(settings.maxExtension + 2 * settings.trackingHitPadding),
        );
        el.setAttribute("height", String(spacing));
      });

      const [, , verticalAxis, bottomY] = poses.idle.leftWing;
      const arrowHitTop =
        bottomY -
        settings.arrowLength -
        settings.bobAmplitude -
        settings.arrowHitPadding;
      const arrowHitBottom =
        bottomY + settings.bobAmplitude + settings.arrowHitPadding;
      arrowHit.setAttribute(
        "x",
        String(
          verticalAxis - settings.wingSpread - settings.arrowHitPadding,
        ),
      );
      arrowHit.setAttribute("y", String(arrowHitTop));
      arrowHit.setAttribute(
        "width",
        String(2 * (settings.wingSpread + settings.arrowHitPadding)),
      );
      arrowHit.setAttribute("height", String(arrowHitBottom - arrowHitTop));
    };

    const dotColor = parseHexColor(settings.dotColor);
    const dotHoverColor = parseHexColor(settings.hoverColor);

    let hoveredDot: number | null = null;
    let arrowHovered = false;
    const applyHoverColors = () => {
      const arrowStroke = arrowHovered ? "var(--dot-hover-color)" : "";
      leftWing.style.stroke = arrowStroke;
      rightWing.style.stroke = arrowStroke;
      pieces.forEach((el, i) => {
        el.style.stroke = arrowHovered
          ? arrowStroke
          : hoveredDot === null
            ? ""
            : mixColors(
                dotColor,
                dotHoverColor,
                settings.colorFalloff ** Math.abs(i - hoveredDot),
              );
      });
    };

    const extensions = new Float64Array(dotCount);
    const advanceExtensions = (dt: number): boolean => {
      const focusDot = getFocusDot(dotCount);
      const alpha = reduceMotion.matches
        ? 1
        : 1 - Math.exp(-dt / settings.smoothingTau);
      let settled = true;
      for (let i = 0; i < dotCount; i++) {
        const targetLength = getExtensionLength(i, focusDot);
        const frameLength =
          extensions[i] + (targetLength - extensions[i]) * alpha;
        if (Math.abs(targetLength - frameLength) < 0.05) {
          extensions[i] = targetLength;
        } else {
          extensions[i] = frameLength;
          settled = false;
        }
      }
      return settled;
    };

    const setLine = (
      el: SVGLineElement,
      f: LineEndpoints,
      g: LineEndpoints,
      s: number,
      extendLeft = 0,
      offsetY = 0,
    ) => {
      el.setAttribute("x1", String(lerp(f[0], g[0], s) - extendLeft));
      el.setAttribute("y1", String(lerp(f[1], g[1], s) + offsetY));
      el.setAttribute("x2", String(lerp(f[2], g[2], s)));
      el.setAttribute("y2", String(lerp(f[3], g[3], s) + offsetY));
    };

    const applyGeometry = (t: number) => {
      const segment = Math.min(
        Math.max(Math.floor(t), 0),
        transitions.length - 1,
      );
      const from = poses[POSE_ORDER[segment]];
      const to = poses[POSE_ORDER[segment + 1]];
      const local = transitions[segment].ease(t - segment);
      const trackingExtensionScale =
        segment === transitions.length - 1 ? local : 0;
      const idleBobScale = segment === 0 ? 1 - local : 0;
      const bobOffset =
        idleBobScale *
        settings.bobAmplitude *
        Math.sin((2 * Math.PI * bobTime.current) / settings.bobPeriod);
      setLine(leftWing, from.leftWing, to.leftWing, local, 0, bobOffset);
      setLine(rightWing, from.rightWing, to.rightWing, local, 0, bobOffset);
      pieces.forEach((el, i) =>
        setLine(
          el,
          from.pieces[i],
          to.pieces[i],
          local,
          trackingExtensionScale * extensions[i],
          bobOffset,
        ),
      );
    };

    const syncState = () => {
      const next = getStateForScroll(window.scrollY);
      if (next !== a.state) {
        a.state = next;
        svg.dataset.state = next;
        if (next !== "tracking" && hoveredDot !== null) {
          hoveredDot = null;
          applyHoverColors();
        }
        if (next !== "idle" && arrowHovered) {
          arrowHovered = false;
          applyHoverColors();
        }
      }
    };

    const advance = (dt: number) => {
      if (reduceMotion.matches) {
        a.current = a.target;
        return;
      }
      let remaining = dt;
      while (remaining > 0 && a.current !== a.target) {
        const dir = a.target > a.current ? 1 : -1;
        const segment =
          dir > 0
            ? Math.min(Math.floor(a.current), transitions.length - 1)
            : Math.max(Math.ceil(a.current) - 1, 0);
        const boundary = dir > 0 ? segment + 1 : segment;
        const stop =
          dir > 0 ? Math.min(a.target, boundary) : Math.max(a.target, boundary);
        const { duration } = transitions[segment];
        const timeToStop = Math.abs(stop - a.current) * duration;
        if (timeToStop <= remaining) {
          a.current = stop;
          remaining -= timeToStop;
        } else {
          a.current += (remaining / duration) * dir;
          remaining = 0;
        }
      }
    };

    const step = (now: number) => {
      const dt = Math.min((now - a.lastTime) / 1000, 0.1);
      a.lastTime = now;
      advance(dt);
      const extensionsSettled = advanceExtensions(dt);
      if (!reduceMotion.matches) bobTime.current += dt;
      applyGeometry(a.current);
      const bobbing = a.current === 0 && !reduceMotion.matches;
      if (a.current === a.target && extensionsSettled && !bobbing) {
        a.rafId = null;
        return;
      }
      a.rafId = requestAnimationFrame(step);
    };

    const kick = () => {
      if (a.rafId === null) {
        a.lastTime = performance.now();
        a.rafId = requestAnimationFrame(step);
      }
    };

    const onScroll = () => {
      syncState();
      a.target = getTargetForState(a.state);
      kick();
    };

    syncState();
    a.target = getTargetForState(a.state);
    if (!didEnter.current) {
      a.current = reduceMotion.matches ? a.target : Math.max(a.target - 1, 0);
      didEnter.current = true;
    }
    const mountFocusDot = getFocusDot(dotCount);
    for (let i = 0; i < dotCount; i++) {
      extensions[i] = getExtensionLength(i, mountFocusDot);
    }
    applyGeometry(a.current);
    placeHitAreas();
    kick();

    const resizeObserver = new ResizeObserver(() => {
      poses = getPoses(svg.getBoundingClientRect(), geometry);
      applyGeometry(a.current);
      placeHitAreas();
    });
    resizeObserver.observe(svg);

    const hoverHandlers = hits.map((el, i) => {
      const enter = () => {
        if (!canHover.matches) return;
        hoveredDot = i;
        applyHoverColors();
      };
      const leave = () => {
        if (hoveredDot !== i) return;
        hoveredDot = null;
        applyHoverColors();
      };
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
      return { el, enter, leave };
    });

    const arrowEnter = () => {
      if (!canHover.matches) return;
      arrowHovered = true;
      applyHoverColors();
    };
    const arrowLeave = () => {
      arrowHovered = false;
      applyHoverColors();
    };
    arrowHit.addEventListener("mouseenter", arrowEnter);
    arrowHit.addEventListener("mouseleave", arrowLeave);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      hoverHandlers.forEach(({ el, enter, leave }) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
      arrowHit.removeEventListener("mouseenter", arrowEnter);
      arrowHit.removeEventListener("mouseleave", arrowLeave);
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      if (a.rafId !== null) cancelAnimationFrame(a.rafId);
      a.rafId = null;
    };
  }, [dotCount]);

  return (
    <svg
      ref={svgRef}
      className="cooler-scrollbar"
      data-state="idle"
      aria-hidden="true"
      style={
        {
          "--dot-color": settings.dotColor,
          "--dot-hover-color": settings.hoverColor,
          "--stroke-width": settings.strokeWidth,
        } as CSSProperties
      }
    >
      <line ref={leftWingRef} />
      <line ref={rightWingRef} />
      {Array.from({ length: dotCount }, (_, i) => (
        <line
          key={`line-${i}`}
          ref={(el) => {
            pieceRefs.current[i] = el;
          }}
        />
      ))}
      {Array.from({ length: dotCount }, (_, i) => (
        <rect
          key={`hit-${i}`}
          className="hit-area"
          ref={(el) => {
            hitRefs.current[i] = el;
          }}
          onClick={() => scrollToDot(i, dotCount)}
        />
      ))}
      <rect
        ref={arrowHitRef}
        className="arrow-hit"
        onClick={scrollDownOneViewport}
      />
    </svg>
  );
}
