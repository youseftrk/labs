"use client";

import { useState } from "react";
import Link from "next/link";
import { Liquid } from "@/components/jakub/gooey";
import { useReducedMotion } from "@/components/jakub/gooey/hooks";

type Hot = "lab" | "mail" | null;

export function NavLiquid() {
  const [hot, setHot] = useState<Hot>(null);
  const reduced = useReducedMotion();
  const morph = reduced
    ? undefined
    : { shape: true as const, bounce: 0.18, speed: 1.2, contentBlur: 0 };

  return (
    <Liquid
      blur={7}
      contrast={18}
      fill="var(--goo)"
      filterPadding={16}
      className="nav-liquid"
    >
      <Liquid.Item observe morph={morph}>
        <Link
          href="/lab"
          className="pill"
          data-hot={hot === "lab" ? "true" : undefined}
          onPointerEnter={() => setHot("lab")}
          onPointerLeave={() => setHot(null)}
          onFocus={() => setHot("lab")}
          onBlur={() => setHot(null)}
        >
          Lab
        </Link>
      </Liquid.Item>
      <Liquid.Item observe morph={morph}>
        <a
          href="mailto:hello@yousefturk.com"
          className="pill"
          data-hot={hot === "mail" ? "true" : undefined}
          onPointerEnter={() => setHot("mail")}
          onPointerLeave={() => setHot(null)}
          onFocus={() => setHot("mail")}
          onBlur={() => setHot(null)}
        >
          E-Mail
        </a>
      </Liquid.Item>
    </Liquid>
  );
}
