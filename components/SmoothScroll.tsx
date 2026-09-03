"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { getLenis, setLenis } from "@/lib/smooth-scroll";

/** Same gate as CoolerScrollbar. Touch keeps native scroll. */
const DESKTOP = "(hover: hover) and (min-width: 768px)";

/** Mirrors `scroll-mt-8` on the /lab shelves; Lenis ignores scroll-margin. */
const ANCHOR_OFFSET = -32;

/**
 * Lenis on the window, desktop only. It animates `window.scrollTo`, so
 * everything that already reads `window.scrollY` (CoolerScrollbar, DiaAurora's
 * useScroll) keeps working untouched.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP);
    let lenis: Lenis | null = null;

    const mount = () => {
      if (lenis) return;
      lenis = new Lenis({
        // Tighter than the 0.1 default. The page should feel weighted, not floaty.
        lerp: 0.14,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: true,
        stopInertiaOnNavigate: true,
        respectReducedMotion: true,
      });
      setLenis(lenis);
    };

    const unmount = () => {
      lenis?.destroy();
      lenis = null;
      setLenis(null);
    };

    const sync = () => (desktop.matches ? mount() : unmount());
    sync();
    desktop.addEventListener("change", sync);

    // Same-page hash links inside the content. Native hash jumps would race
    // the smoother, and Lenis cannot see scroll-margin, so we do the offset.
    const onClick = (event: MouseEvent) => {
      if (!lenis || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const a = (event.target as Element | null)?.closest("a");
      if (!a || !a.closest("#content")) return;
      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        !url.hash
      ) {
        return;
      }
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", url.hash);
      lenis.scrollTo(target, {
        offset: ANCHOR_OFFSET,
        immediate: lenis.prefersReducedMotion,
      });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      desktop.removeEventListener("change", sync);
      unmount();
    };
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    // New route, new document height. Also land on a hash with the shelf offset.
    lenis.resize();
    const hash = window.location.hash;
    if (!hash) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) lenis.scrollTo(target, { offset: ANCHOR_OFFSET, immediate: true });
  }, [pathname]);

  return null;
}
