import Link from "next/link";
import { CloseMark } from "@/components/CloseMark";
import { OrbMark } from "@/components/OrbMark";
import { RevealList } from "@/components/RevealList";
import { ShareBar } from "@/components/ShareBar";
import { labPath, writeups, writing } from "@/content/vault";

export const metadata = {
  title: "Writing / Yousef Turk",
  description: "Notes and writeups.",
};

export default function WritingPage() {
  return (
    <main className="wrap py-16 sm:py-20">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="name text-[2rem]">Writing</h1>
          <p className="mt-4 max-w-[32rem] text-mute">
            Notes I&apos;ve actually finished. Pipelines and notebooks when
            they&apos;re ready to read.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <OrbMark state="composing" />
          <CloseMark href="/" />
        </div>
      </div>
      <ShareBar
        path="/writing"
        markdown={"# Writing\n\nNotes and writeups by Yousef Turk.\n\n{{url}}"}
      />

      <section className="mt-12">
        <h2 className="section">Writeups</h2>
        {writeups.length === 0 ? (
          <div className="mt-8 max-w-[36rem]">
            <p>Nothing here yet</p>
            <p className="mt-2 text-[0.95rem] text-mute" style={{ textWrap: "pretty" }}>
              When I finish a pipeline or a notebook I can stand behind, it
              lives here as a page. That&apos;s the thing you send. Not a repo.
            </p>
          </div>
        ) : (
          <RevealList className="mt-8 space-y-8">
            {writeups.map((entry) => (
              <li key={entry.slug}>
                <Link href={labPath(entry.slug)} className="row group block">
                  <p className="name text-[1.05rem] group-hover:underline">
                    {entry.title}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-mute">{entry.date}</p>
                  <p
                    className="mt-2 max-w-[36rem] text-[0.95rem] text-body"
                    style={{ textWrap: "pretty" }}
                  >
                    {entry.blurb}
                  </p>
                </Link>
              </li>
            ))}
          </RevealList>
        )}
      </section>

      <section className="mt-16">
        <h2 className="section">Notes</h2>
        <RevealList className="mt-8 space-y-8">
        {writing.map((entry) => (
          <li key={entry.slug}>
            <Link href={labPath(entry.slug)} className="row group block">
              <p className="name text-[1.05rem] group-hover:underline">
                {entry.title}
              </p>
              <p className="mt-1 text-[0.8125rem] text-mute">{entry.date}</p>
              <p
                className="mt-2 max-w-[36rem] text-[0.95rem] text-body"
                style={{ textWrap: "pretty" }}
              >
                {entry.blurb}
              </p>
            </Link>
          </li>
        ))}
        </RevealList>
      </section>
    </main>
  );
}
