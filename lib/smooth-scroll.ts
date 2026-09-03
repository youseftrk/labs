import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis() {
  return instance;
}

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll the page. Goes through Lenis when it is driving the page (desktop),
 * native otherwise, so the scrollbar and anchors never fight the smoother.
 */
export function scrollPageTo(target: number | HTMLElement, offset = 0) {
  if (instance && !instance.isStopped) {
    instance.scrollTo(target, { offset, immediate: reduced() });
    return;
  }
  const top =
    typeof target === "number"
      ? target
      : target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({
    top: top + offset,
    behavior: reduced() ? "auto" : "smooth",
  });
}
