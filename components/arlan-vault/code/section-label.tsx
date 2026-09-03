"use client";

import type { ReactNode } from "react";

export function SectionLabel({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="section text-[1rem]">{children}</p>
      {action}
    </div>
  );
}
