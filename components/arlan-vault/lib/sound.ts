export type ButtonSound = "soft" | "click" | "none";

export function hoverLink(): void {}
export function buttonHover(_kind?: ButtonSound): void {}
export function buttonClick(_kind?: ButtonSound): void {}
export function swirlFormation(): void {}
export function swirlChurn(): { stop: () => void } {
  return { stop() {} };
}
export function swirlMove(_speed?: number): void {}
export function swirlClick(): void {}
