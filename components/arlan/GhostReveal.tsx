"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** Feathered bleed-in via a CSS gradient mask. No PNG required. */
export function GhostReveal({
  children,
  className = "",
  duration = 900,
  delay = 0,
  eager = false,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  /** Start the mask as soon as we mount. Hover cards can't wait on the observer. */
  eager?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (eager) {
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setOpen(true)),
      );
      return () => cancelAnimationFrame(id);
    }
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setOpen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setOpen(true);
        io.disconnect();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const mask: CSSProperties = reduce
    ? { opacity: 1 }
    : {
        WebkitMaskImage:
          "linear-gradient(to top, transparent 0%, #000 28%, #000 100%)",
        maskImage: "linear-gradient(to top, transparent 0%, #000 28%, #000 100%)",
        WebkitMaskSize: "100% 420%",
        maskSize: "100% 420%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: open ? "0% 100%" : "0% 0%",
        maskPosition: open ? "0% 100%" : "0% 0%",
        transition: `mask-position ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, -webkit-mask-position ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      };

  return (
    <div ref={ref} className={className} style={mask}>
      {children}
    </div>
  );
}
