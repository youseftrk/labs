"use client";

import { useEffect, useRef } from "react";
import { Typer } from "./typer";
import "./typer.css";

export function TyperLine({
  text,
  className = "",
  fps = 20,
  cycles = 3,
}: {
  text: string;
  className?: string;
  fps?: number;
  cycles?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const typer = new Typer(el, { fps, cycles, initVisible: reduce });
    if (!reduce) typer.in();
    return () => typer.destroy();
  }, [text, fps, cycles]);

  return (
    <span ref={ref} data-typer data-typer-type="initial" className={className}>
      {text}
    </span>
  );
}
