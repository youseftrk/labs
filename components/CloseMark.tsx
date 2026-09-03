import Link from "next/link";

export function CloseMark({ href }: { href: string }) {
  return (
    <Link href={href} className="close" aria-label="Close">
      ×
    </Link>
  );
}
