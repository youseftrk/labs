"use client";

import { useEffect, useState } from "react";

export function useQuiet() {
  const [quiet, setQuiet] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setQuiet(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return quiet;
}
