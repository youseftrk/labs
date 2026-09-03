import Link from "next/link";

export function WritingBtn() {
  return (
    <Link href="/writing" className="rbtn b-live">
      <span className="lbl">Writing</span>
    </Link>
  );
}
