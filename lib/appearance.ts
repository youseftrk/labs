export const APPEARANCE_KEY = "appearance";

export type Appearance = "light" | "dark";

export const APPEARANCE_BOOT = `(function(){
  var key=${JSON.stringify(APPEARANCE_KEY)};
  var theme;
  try { theme = localStorage.getItem(key); } catch (e) {}
  if (theme !== "light" && theme !== "dark") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  var r = document.documentElement;
  r.classList.remove("light", "dark");
  r.classList.add(theme);
  r.setAttribute("data-theme", theme);
  r.style.colorScheme = theme;
  try {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      r.classList.add("dia-boot");
      setTimeout(function(){ r.classList.remove("dia-boot"); }, 2800);
    }
  } catch (e) {}
})();`;

function readStored(): Appearance | null {
  try {
    const value = localStorage.getItem(APPEARANCE_KEY);
    if (value === "light" || value === "dark") return value;
  } catch {
    /* private mode */
  }
  return null;
}

export function currentAppearance(): Appearance {
  if (typeof document === "undefined") return "light";
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  if (typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function suppressThemeTransitions() {
  const style = document.createElement("style");
  style.append(
    document.createTextNode("*,*::before,*::after{transition:none !important}"),
  );
  document.head.append(style);
  void document.body?.offsetHeight;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => style.remove());
  });
}

export function applyAppearance(next: Appearance, persist: boolean) {
  suppressThemeTransitions();
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(next);
  root.setAttribute("data-theme", next);
  root.style.colorScheme = next;
  if (persist) {
    try {
      localStorage.setItem(APPEARANCE_KEY, next);
    } catch {
      /* private mode */
    }
  }
}

export function toggleAppearance() {
  applyAppearance(currentAppearance() === "dark" ? "light" : "dark", true);
}

export function syncAppearanceFromSystem() {
  if (readStored()) return;
  const dark =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-color-scheme: dark)").matches;
  applyAppearance(dark ? "dark" : "light", false);
}
