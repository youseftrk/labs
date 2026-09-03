"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useQuiet } from "./use-quiet";

export function Island({ hearts = true }: { hearts?: boolean }) {
  const quiet = useQuiet();
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (!hearts || quiet) return;
    const id = window.setInterval(() => setBurst((n) => n + 1), 1400);
    return () => window.clearInterval(id);
  }, [hearts, quiet]);

  return (
    <div className="stage relative grid h-[16rem] place-items-center bg-[#0b0b0d]">
      <div
        className="relative"
        style={{ filter: "blur(7px) contrast(18)", transform: "scale(1)" }}
      >
        <div className="mx-auto h-8 w-40 rounded-full bg-black" />
        <div className="-mt-2 ml-[4.6rem] grid h-16 w-16 place-items-center rounded-full bg-[#c9a27a] text-[1.15rem] font-normal text-[#2a1c12]">
          Y
        </div>
      </div>
      {hearts &&
        [0, 1, 2].map((i) => (
          <span
            key={`${burst}-${i}`}
            aria-hidden
            className="pointer-events-none absolute text-[#ff4d6d]"
            style={{
              left: `calc(50% + ${(i - 1) * 18}px)`,
              bottom: "4.2rem",
              animation: quiet
                ? undefined
                : `bakai-heart 1.2s ease-out ${i * 80}ms both`,
            }}
          >
            ♥
          </span>
        ))}
      <style>{`
        @keyframes bakai-heart {
          from { opacity: 0; transform: translateY(8px) scale(0.6); }
          30% { opacity: 1; }
          to { opacity: 0; transform: translateY(-46px) scale(1); }
        }
      `}</style>
    </div>
  );
}

export function Loader() {
  const quiet = useQuiet();
  return (
    <div className="stage grid h-[12rem] place-items-center bg-[#0b0b0d]">
      <div
        className="flex items-center gap-2"
        style={{ filter: "blur(6px) contrast(16)" }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-7 w-7 rounded-full bg-white"
            style={{
              animation: quiet
                ? undefined
                : `bakai-blob 0.9s ease-in-out ${i * 120}ms infinite alternate`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes bakai-blob {
          from { transform: translateY(0) scale(0.86); }
          to { transform: translateY(-10px) scale(1.08); }
        }
      `}</style>
    </div>
  );
}

export function Login() {
  const [step, setStep] = useState<"gate" | "email" | "code" | "done">("gate");
  const [email, setEmail] = useState("");
  const emailId = useId();
  const codeId = useId();

  return (
    <div
      className="stage grid min-h-[22rem] place-items-center p-6"
      style={{
        backgroundImage:
          "radial-gradient(#cfcfcf 0.7px, transparent 0.7px), linear-gradient(#efeae2, #e4ddd3)",
        backgroundSize: "4px 4px, auto",
      }}
    >
      {step === "gate" ? (
        <button
          type="button"
          className="rbtn b-glossy"
          onClick={() => setStep("email")}
        >
          <span className="lbl">Log in</span>
        </button>
      ) : (
        <form
          className="w-full max-w-[20rem] rounded-[18px] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          style={{ borderRadius: 18 }}
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            if (step === "email") setStep("code");
            else if (step === "code") setStep("done");
          }}
        >
          <p className="name text-[1.15rem]">Log in</p>
          {step === "email" && (
            <div className="mt-4">
              <label htmlFor={emailId} className="text-[0.875rem] text-mute">
                Email
              </label>
              <input
                id={emailId}
                className="bakai-field mt-1"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
              <button type="submit" className="rbtn b-glossy mt-4 w-full">
                <span className="lbl">Continue with email</span>
              </button>
            </div>
          )}
          {step === "code" && (
            <div className="mt-4">
              <label htmlFor={codeId} className="text-[0.875rem] text-mute">
                Six-digit code
              </label>
              <input
                id={codeId}
                className="bakai-field mt-1 tracking-[0.4em]"
                inputMode="numeric"
                autoComplete="one-time-code"
                name="code"
                maxLength={6}
                placeholder="000000"
              />
              <button type="submit" className="rbtn b-glossy mt-4 w-full">
                <span className="lbl">Verify code</span>
              </button>
            </div>
          )}
          {step === "done" && (
            <p className="mt-4 text-[0.95rem]">You are in.</p>
          )}
        </form>
      )}
    </div>
  );
}

const PLANS = ["Unlimited", "30-day pass", "10-class pack", "Drop-in"];

export function Dropdown() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(PLANS[0]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="stage stage-pad min-h-[18rem]">
      <div ref={boxRef} className="relative w-[200px]">
        <button
          type="button"
          className="rbtn b-flat w-full"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="lbl">{value}</span>
        </button>
        {open && (
          <ul
            role="listbox"
            className="absolute top-[52px] z-10 w-full overflow-hidden rounded-[11px] bg-white py-1 outline outline-1 outline-[oklch(0_0_0/0.1)]"
          >
            {PLANS.map((plan) => (
              <li key={plan}>
                <button
                  type="button"
                  role="option"
                  aria-selected={plan === value}
                  className="chip-plain block w-full px-3 py-2 text-left text-[0.875rem] text-ink"
                  onClick={() => {
                    setValue(plan);
                    setOpen(false);
                  }}
                >
                  {plan}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function MemberDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nameId = useId();
  const mailId = useId();

  const close = () => {
    dialogRef.current?.close();
    triggerRef.current?.focus();
  };

  return (
    <div className="stage stage-pad">
      <button
        ref={triggerRef}
        type="button"
        className="rbtn b-glossy"
        onClick={() => dialogRef.current?.showModal()}
      >
        <span className="lbl">Add member</span>
      </button>
      <dialog
        ref={dialogRef}
        className="w-[min(22rem,calc(100%-2rem))] rounded-[18px] border-0 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
        style={{ borderRadius: 18 }}
        onClose={() => triggerRef.current?.focus()}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
      >
        <form
          method="dialog"
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            close();
          }}
        >
          <p className="name text-[1.15rem]">Add member</p>
          <div>
            <label htmlFor={nameId} className="text-[0.875rem] text-mute">
              Name
            </label>
            <input
              id={nameId}
              className="bakai-field mt-1"
              name="name"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor={mailId} className="text-[0.875rem] text-mute">
              Email
            </label>
            <input
              id={mailId}
              className="bakai-field mt-1"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@example.com"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="rbtn b-glossy">
              <span className="lbl">Add member</span>
            </button>
            <button type="button" className="chip-plain px-3" onClick={close}>
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

export function Accounts() {
  const [held, setHeld] = useState(false);
  const [progress, setProgress] = useState(0);
  const quiet = useQuiet();

  useEffect(() => {
    if (!held) {
      setProgress(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      setProgress(t);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [held]);

  const gone = progress >= 1;

  return (
    <div className="stage stage-pad">
      <button
        type="button"
        className="relative flex min-h-11 w-full items-center justify-between rounded-[12px] bg-[#f4f4f2] px-4 py-3 text-left"
        onPointerDown={() => setHeld(true)}
        onPointerUp={() => setHeld(false)}
        onPointerLeave={() => setHeld(false)}
        aria-label={gone ? "Account removed" : "Hold to delete account"}
      >
        <span
          className="text-[0.95rem] text-ink"
          style={{
            opacity: gone ? 0 : 1 - progress * 0.8,
            filter: `blur(${progress * 4}px)`,
            transition: quiet ? "none" : undefined,
          }}
        >
          Noor · studio account
        </span>
        <span className="text-[0.8125rem] text-mute">
          {gone ? "Gone" : "Hold to delete"}
        </span>
      </button>
    </div>
  );
}

const STAGES = ["To call", "Called"] as const;
const SEED = [
  { id: "1", name: "Noor", stage: "To call", note: "Asked about evening slots" },
  { id: "2", name: "Omar", stage: "To call", note: "Walk-in, left a number" },
  { id: "3", name: "Lina", stage: "Called", note: "Wants a trial class" },
  { id: "4", name: "Maya", stage: "Called", note: "Follow up Friday" },
];

export function Pipeline({ view = "kanban" }: { view?: "kanban" | "list" }) {
  const [rows, setRows] = useState(SEED);

  const move = (id: string, stage: (typeof STAGES)[number]) => {
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, stage } : r)));
  };

  if (view === "list") {
    return (
      <div className="stage stage-pad space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex min-h-11 items-center justify-between gap-3 rounded-[10px] bg-[#f6f6f4] px-3 py-2"
          >
            <div>
              <p className="text-[0.95rem] text-ink">{row.name}</p>
              <p className="text-[0.8125rem] text-mute">{row.note}</p>
            </div>
            <span className="text-[0.8125rem] text-mute">{row.stage}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stage grid min-h-[16rem] grid-cols-2 gap-3 p-3">
      {STAGES.map((stage) => (
        <section key={stage} className="rounded-[12px] bg-[#f4f4f2] p-2">
          <h3 className="px-2 py-1 text-[0.8125rem] text-mute">
            {stage} ({rows.filter((r) => r.stage === stage).length})
          </h3>
          <ul className="mt-1 space-y-2">
            {rows
              .filter((r) => r.stage === stage)
              .map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    className="block w-full rounded-[10px] bg-white px-3 py-2 text-left outline outline-1 outline-[oklch(0_0_0/0.08)]"
                    onClick={() =>
                      move(row.id, stage === "To call" ? "Called" : "To call")
                    }
                  >
                    <p className="text-[0.95rem] text-ink">{row.name}</p>
                    <p className="text-[0.8125rem] text-mute">{row.note}</p>
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function Icons() {
  const items = [
    { id: "plus", label: "Add", d: "M12 5v14M5 12h14" },
    { id: "search", label: "Search", d: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10-1-4.3-4.3" },
    { id: "heart", label: "Save", d: "M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7 3.8C19 15.6 12 20 12 20Z" },
    { id: "check", label: "Done", d: "M5 12.5 9.5 17 19 7.5" },
  ];
  return (
    <div className="stage stage-pad flex flex-wrap gap-3">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-label={item.label}
          className="grid h-11 w-11 place-items-center rounded-[12px] bg-[#f4f4f2] text-ink"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={item.d} />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function Charts({ kind = "line" }: { kind?: "line" | "bar" | "pie" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const quiet = useQuiet();
  const [range, setRange] = useState<"7D" | "14D" | "30D">("14D");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = 560;
    const h = 240;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    const n = range === "7D" ? 7 : range === "14D" ? 14 : 30;
    const data = Array.from({ length: n }, (_, i) => 12 + ((i * 17) % 26));
    const max = Math.max(...data);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);

    if (kind === "pie") {
      const total = data.reduce((a, b) => a + b, 0);
      let a0 = -Math.PI / 2;
      const colors = ["#3b82f6", "#1e3a8a", "#93c5fd", "#2563eb"];
      data.slice(0, 4).forEach((v, i) => {
        const slice = (v / total) * Math.PI * 2 * 2.2;
        ctx.beginPath();
        ctx.fillStyle = colors[i];
        ctx.moveTo(w / 2, h / 2);
        ctx.arc(w / 2, h / 2, 78, a0, a0 + slice);
        ctx.closePath();
        ctx.fill();
        a0 += slice;
      });
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      return;
    }

    const left = 24;
    const bottom = h - 24;
    const top = 24;
    const innerW = w - 48;
    const innerH = bottom - top;
    ctx.fillStyle = "#3b82f6";
    data.forEach((v, i) => {
      const x = left + (i / Math.max(n - 1, 1)) * innerW;
      const y = bottom - (v / max) * innerH;
      if (kind === "bar") {
        for (let yy = y; yy < bottom; yy += 6) {
          ctx.fillRect(x - 6, yy, 5, 4);
        }
      }
    });
    if (kind === "line") {
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = left + (i / Math.max(n - 1, 1)) * innerW;
        const y = bottom - (v / max) * innerH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    void quiet;
  }, [kind, range, quiet]);

  return (
    <div className="stage p-4">
      <div className="flex flex-wrap gap-2">
        {(["7D", "14D", "30D"] as const).map((id) => (
          <button
            key={id}
            type="button"
            className="chip-plain"
            data-on={range === id ? "true" : undefined}
            onClick={() => setRange(id)}
          >
            {id}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[0.8125rem] text-mute">New members</p>
      <p className="name text-[1.5rem]" style={{ fontVariantNumeric: "tabular-nums" }}>
        +629
      </p>
      <canvas ref={ref} className="mt-2 w-full" aria-label="Membership chart" />
    </div>
  );
}

export function SidebarStudy() {
  const items = ["Home", "Admissions", "Members", "Chapters", "Analytics"];
  const [on, setOn] = useState("Home");
  return (
    <div className="stage flex min-h-[16rem]">
      <nav className="w-44 border-r border-line p-3" aria-label="Studio">
        <p className="px-2 text-[0.75rem] uppercase tracking-[0.12em] text-mute">
          Main directory
        </p>
        <ul className="mt-3 space-y-1">
          {items.map((item) => (
            <li key={item}>
              <button
                type="button"
                className="min-h-10 w-full rounded-[10px] px-2 text-left text-[0.9375rem]"
                style={{
                  background: on === item ? "#eee" : "transparent",
                  color: "var(--ink)",
                }}
                onClick={() => setOn(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <p className="p-6 text-[0.95rem] text-mute">{on}</p>
    </div>
  );
}

export function FoheBoard() {
  const cols = [
    { name: "Waiting", n: 3 },
    { name: "Ready for review", n: 2 },
    { name: "Decided", n: 2 },
  ];
  return (
    <div className="stage grid min-h-[16rem] grid-cols-3 gap-2 bg-[#dedede] p-3">
      {cols.map((col) => (
        <section key={col.name} className="rounded-[12px] bg-white/80 p-2">
          <h3 className="text-[0.8125rem] text-mute">
            {col.name} ({col.n})
          </h3>
          <ul className="mt-2 space-y-2">
            {Array.from({ length: col.n }, (_, i) => (
              <li
                key={i}
                className="rounded-[10px] bg-white px-3 py-2 text-[0.875rem] outline outline-1 outline-[oklch(0_0_0/0.08)]"
              >
                Applicant {i + 1}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function OymoScan() {
  return (
    <div className="stage grid min-h-[16rem] place-items-center bg-[#eed2fb]">
      <div className="relative h-40 w-40 rounded-[1.5rem] bg-white outline outline-1 outline-[oklch(0_0_0/0.1)]">
        <span className="absolute inset-3 rounded-[1.1rem] border border-dashed border-[#c084fc]" />
        <p className="absolute inset-0 grid place-items-center text-[0.875rem] text-ink">
          Scan
        </p>
      </div>
    </div>
  );
}

export function SpinaList() {
  const rows = [
    { name: "Rent", amount: "1,200" },
    { name: "Print", amount: "84" },
    { name: "Tools", amount: "310" },
  ];
  return (
    <div className="stage min-h-[16rem] bg-[#0a0a0a] p-4 text-[#f4f4f4]">
      <p className="text-[0.8125rem] uppercase tracking-[0.12em] text-[#9b9b9b]">
        Expenses
      </p>
      <ul className="mt-4 space-y-2">
        {rows.map((row) => (
          <li
            key={row.name}
            className="flex min-h-11 items-center justify-between rounded-[12px] bg-[#161616] px-3"
          >
            <span>{row.name}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {row.amount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
