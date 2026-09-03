"use client";

import { useLayoutEffect, useState } from "react";
import {
  currentAppearance,
  toggleAppearance,
  type Appearance,
} from "@/lib/appearance";

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3v1.6M12 19.4V21M4.93 4.93l1.13 1.13M17.94 17.94l1.13 1.13M3 12h1.6M19.4 12H21M4.93 19.07l1.13-1.13M17.94 6.06l1.13-1.13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15.2 3.1a8.6 8.6 0 1 0 5.7 15.4A7.2 7.2 0 0 1 15.2 3.1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Appearance>("light");
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const read = () => setTheme(currentAppearance());
    read();
    setReady(true);
    const root = document.documentElement;
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => mo.disconnect();
  }, []);

  const dark = theme === "dark";
  const label = ready
    ? dark
      ? "Use light appearance"
      : "Use dark appearance"
    : "Switch appearance";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      aria-pressed={ready ? dark : undefined}
      onClick={() => {
        toggleAppearance();
        setTheme(currentAppearance());
      }}
    >
      <span className="theme-toggle-swap">
        <span className="theme-icon theme-icon-sun">
          <SunIcon />
        </span>
        <span className="theme-icon theme-icon-moon">
          <MoonIcon />
        </span>
      </span>
    </button>
  );
}
