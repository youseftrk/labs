"use client";

import { ThinkingOrb } from "@/components/jakub/orbs/ThinkingOrb";
import type { OrbState } from "@/components/jakub/orbs/types";

export function OrbMark({
  state = "breathing",
  portrait = false,
}: {
  state?: OrbState;
  portrait?: boolean;
}) {
  if (!portrait) {
    return (
      <ThinkingOrb
        state={state}
        size={64}
        theme="auto"
        aria-hidden
        role="presentation"
      />
    );
  }

  return (
    <div className="orb-mark" role="img" aria-label="Yousef Turk">
      <img
        src="/yousef.jpg"
        alt=""
        width={120}
        height={120}
        className="orb-mark-photo"
      />
    </div>
  );
}
