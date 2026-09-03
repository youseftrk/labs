"use client";

import { useEffect, useRef, useState } from "react";
import { MetalFx } from "@/components/jakub/metal";

function Chip({
  label,
  done,
  onCopy,
}: {
  label: string;
  done: boolean;
  onCopy: () => void;
}) {
  return (
    <MetalFx variant="button" preset="silver" theme="auto" strength={0.62}>
      <button type="button" className="chip" onClick={onCopy}>
        {done ? "Copied" : label}
      </button>
    </MetalFx>
  );
}

export function ShareBar({
  path,
  markdown,
}: {
  path: string;
  markdown: string;
}) {
  const [copied, setCopied] = useState<"link" | "md" | null>(null);
  const timer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function writeClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  }

  async function copy(kind: "link" | "md") {
    const url = `${window.location.origin}${path}`;
    const text = kind === "link" ? url : markdown.replaceAll("{{url}}", url);
    await writeClipboard(text);
    setCopied(kind);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3" aria-live="polite">
      <Chip
        label="Copy link"
        done={copied === "link"}
        onCopy={() => copy("link")}
      />
      <Chip
        label="Copy markdown"
        done={copied === "md"}
        onCopy={() => copy("md")}
      />
    </div>
  );
}
