"use client";

import { Squircle } from "./Squircle";
import { CONTROL_H, radiusFor } from "./tokens";

const fields = ["#ddd8cc", "#d0d8d4", "#dcd4cc", "#ccd4dc", "#d8d0cc"];

export function Poster({
  letter,
  slug,
  size = 88,
}: {
  letter: string;
  slug: string;
  size?: number;
}) {
  const fill = fields[slug.length % fields.length];
  const r = radiusFor(CONTROL_H);

  return (
    <Squircle
      radius={r}
      smoothing={0.65}
      fill={fill}
      stroke="rgba(27,27,27,0.08)"
      strokeWidth={1}
      style={{ width: size, height: size * 1.18, flexShrink: 0 }}
      contentClassName="font-[family-name:var(--font-matter)] font-light text-[#1b1b1b]"
    >
      <span style={{ fontSize: size * 0.34, letterSpacing: "-0.04em" }}>
        {letter}
      </span>
    </Squircle>
  );
}
