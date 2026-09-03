"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Rows that enter in the same frame stagger 40ms apart, capped at 280ms. */
const STEP_MS = 40;
const MAX_STEPS = 7;

/**
 * A list whose rows rise as they scroll into view instead of on mount.
 * After the appear recipe in the design library (scroll-blur-reveal), pulled
 * down to the site's motion locks: 8px, 240ms, no blur. Rows are visible
 * without JS; `html.js` is what lets the CSS hide them first.
 */
export function RevealList({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const rows = Array.from(list.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
    const show = (el: HTMLElement, step: number) => {
      el.style.setProperty("--reveal-delay", `${Math.min(step, MAX_STEPS) * STEP_MS}ms`);
      el.dataset.in = "";
    };
    if (!("IntersectionObserver" in window)) {
      rows.forEach((el) => show(el, 0));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        let step = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          show(el, step++);
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    rows.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <ul ref={ref} className={className ? `reveal ${className}` : "reveal"}>
      {children}
    </ul>
  );
}
