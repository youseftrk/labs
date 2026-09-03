const R2_MEDIA_BASE = "https://pub-58a0dfd4417141169bd84ab545cd7830.r2.dev";

export const MEDIA_BASE = (
  process.env.NEXT_PUBLIC_MEDIA_BASE ?? R2_MEDIA_BASE
).replace(/\/$/, "");

export const MEDIA_ORIGIN = (() => {
  if (!MEDIA_BASE) return "";
  try {
    return new URL(MEDIA_BASE).origin;
  } catch {
    return "";
  }
})();

export function mediaUrl(path: string): string {
  return MEDIA_BASE ? `${MEDIA_BASE}${path}` : path;
}

export interface VideoSource {
  src: string;
  type: string;
}

export function videoSources(base: string): VideoSource[] {
  return [
    {
      src: mediaUrl(`${base}.av1.webm`),
      type: 'video/webm; codecs="av01.0.05M.08"',
    },
    {
      src: mediaUrl(`${base}.vp9.webm`),
      type: "video/webm; codecs=\"vp9\"",
    },
    { src: mediaUrl(`${base}.mp4`), type: "video/mp4" },
  ];
}
