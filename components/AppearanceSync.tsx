"use client";

import { useEffect } from "react";
import { syncAppearanceFromSystem } from "@/lib/appearance";

export function AppearanceSync() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => syncAppearanceFromSystem();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return null;
}
