"use client";

import { useEffect, useRef } from "react";

/**
 * A generated research figure. The SVG is inlined by the server, so it takes
 * the page's colours, and its strokes draw themselves in when it scrolls into
 * view. Every stroke carries `pathLength="1"`, which is what lets the CSS
 * animate `stroke-dashoffset` without measuring anything in JavaScript.
 *
 * Figures are the one place on this site where motion runs past 300ms: a
 * diagram that assembles itself is doing explaining, not decoration. It still
 * ends under 700ms, and reduced motion gets the finished drawing instantly.
 */
export function Figure({
  svg,
  caption,
  source,
}: {
  svg: string;
  caption: string;
  source?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.dataset.in = "";
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = "";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className="figure">
      <div className="figure-svg" dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption>
        {caption}
        {source ? <span className="figure-src">{source}</span> : null}
      </figcaption>
    </figure>
  );
}
