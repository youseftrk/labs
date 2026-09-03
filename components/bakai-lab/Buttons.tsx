"use client";

const KINDS = ["glossy", "glow", "bevel", "flat"] as const;

export type ButtonKind = (typeof KINDS)[number];

function Plus() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ButtonsPlay({ kind }: { kind?: ButtonKind }) {
  const shown = kind ? [kind] : [...KINDS];

  return (
    <div className="stage stage-pad flex flex-wrap items-center gap-3">
      {shown.map((id) => (
        <button key={id} type="button" className={`rbtn b-${id}`}>
          <span className="lbl">
            <Plus />
            Add member
          </span>
        </button>
      ))}
    </div>
  );
}
