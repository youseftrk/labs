"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { DiaGradient } from "@/components/arlan-vault/code/dia-gradient/DiaGradient";

const COVER = 1;
const FOOT_REST = 0.72;
const FOOT_BAND = 0.68;
const RISE = { duration: 0.72, ease: [0.16, 1, 0.3, 1] as const };
const SHUT = { duration: 0.56, ease: [0.65, 0, 0.35, 1] as const };
const OPEN = { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const };
const HOLD_MS = 320;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function restFromScroll(y: number, vh: number, sh: number) {
  const band = vh * FOOT_BAND;
  const left = sh - y - vh;
  const footT = clamp01(band <= 0 ? 1 : (band - left) / band);
  return FOOT_REST * footT;
}

type Play = { stop: () => void };
type TweenOpts = typeof RISE | typeof SHUT | typeof OPEN;

/**
 * One Dia, from the floor. Motion scaleY: rise on load/route, rest on scroll.
 */
export function DiaAurora() {
  const pathname = usePathname();
  const router = useRouter();
  const pathRef = useRef(pathname);
  const lock = useRef(false);
  const reduced = useRef(false);
  const recedeRef = useRef<(() => Promise<void>) | null>(null);
  const riseRef = useRef<((opts: TweenOpts) => Promise<void>) | null>(null);
  const plays = useRef<Play[]>([]);
  const { scrollY } = useScroll();
  const footScale = useMotionValue(0);
  const footOpacity = useTransform(footScale, [0, 0.04], [0, 1]);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    const readRest = () =>
      restFromScroll(
        scrollY.get(),
        window.innerHeight,
        document.documentElement.scrollHeight,
      );

    const stopPlays = () => {
      plays.current.forEach((play) => play.stop());
      plays.current = [];
    };

    const tween = (to: number, opts: TweenOpts) => {
      const play = animate(footScale, [footScale.get(), to], opts);
      plays.current.push(play);
      return play;
    };

    const applyScroll = () => {
      if (lock.current || reduced.current) return;
      footScale.set(readRest());
    };

    recedeRef.current = async () => {
      root.classList.remove("dia-boot");
      if (reduced.current) {
        stopPlays();
        root.classList.remove("dia-shut", "dia-move");
        footScale.set(readRest());
        lock.current = false;
        return;
      }
      lock.current = true;
      root.classList.add("dia-move");
      root.classList.remove("dia-shut");
      stopPlays();
      await tween(readRest(), OPEN);
      lock.current = false;
      root.classList.remove("dia-move");
      applyScroll();
    };

    riseRef.current = async (opts) => {
      if (reduced.current) return;
      lock.current = true;
      root.classList.add("dia-move", "dia-shut");
      stopPlays();
      await tween(COVER, opts);
    };

    const unsub = scrollY.on("change", applyScroll);
    window.addEventListener("resize", applyScroll);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (reduced.current || lock.current) return;
      const a = (event.target as Element | null)?.closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      event.preventDefault();
      const href = `${url.pathname}${url.search}${url.hash}`;
      void riseRef.current?.(SHUT).then(() => router.push(href));
    };

    document.addEventListener("click", onClick, true);
    return () => {
      unsub();
      window.removeEventListener("resize", applyScroll);
      document.removeEventListener("click", onClick, true);
    };
  }, [footScale, router, scrollY]);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    let cancelled = false;
    let bootTimer = 0;
    let holdTimer = 0;

    if (reduced.current) {
      root.classList.remove("dia-boot", "dia-shut");
      footScale.set(
        restFromScroll(0, window.innerHeight, document.documentElement.scrollHeight),
      );
      lock.current = false;
      return;
    }

    lock.current = true;
    footScale.set(0);
    bootTimer = window.setTimeout(() => {
      void (async () => {
        if (cancelled) return;
        await riseRef.current?.(RISE);
        if (cancelled) return;
        holdTimer = window.setTimeout(() => {
          if (!cancelled) void recedeRef.current?.();
        }, HOLD_MS);
      })();
    }, 40);

    return () => {
      cancelled = true;
      window.clearTimeout(bootTimer);
      window.clearTimeout(holdTimer);
    };
  }, [footScale]);

  useEffect(() => {
    if (pathRef.current === pathname) return;
    pathRef.current = pathname;
    if (reduced.current) return;
    let live = true;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (live) void recedeRef.current?.();
      });
    });
    return () => {
      live = false;
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <motion.div
      className="site-foot-glow"
      aria-hidden
      initial={false}
      style={{ scaleY: footScale, opacity: footOpacity }}
    >
      <DiaGradient rise="scroll" from="bottom" />
    </motion.div>
  );
}

/** @deprecated Glow lives on DiaAurora. Kept so old imports compile. */
export function DiaFooterGlow() {
  return null;
}
