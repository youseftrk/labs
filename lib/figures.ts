import { readFileSync } from "node:fs";
import path from "node:path";

const cache = new Map<string, string>();

/**
 * Read a generated figure from `public/figures` at build time.
 * The SVG is inlined rather than used as an `<img>` so it inherits the theme
 * colours and the page can animate its strokes. Server only.
 */
export function readFigure(name: string): string | null {
  // Cache in production only. In dev the figures get rebuilt while the server
  // is running, and a cached SVG would quietly show yesterday's numbers.
  const cacheable = process.env.NODE_ENV === "production";
  if (cacheable && cache.has(name)) return cache.get(name)!;
  if (!/^[\w-]+$/.test(name)) return null;
  try {
    const file = path.join(process.cwd(), "public", "figures", `${name}.svg`);
    const svg = readFileSync(file, "utf8");
    if (cacheable) cache.set(name, svg);
    return svg;
  } catch {
    return null;
  }
}
