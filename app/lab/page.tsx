import Link from "next/link";
import { CloseMark } from "@/components/CloseMark";
import { OrbMark } from "@/components/OrbMark";
import { RevealList } from "@/components/RevealList";
import { ShareBar } from "@/components/ShareBar";
import {
  entriesOn,
  SHELF_LABEL,
  TOC_SHELVES,
  labPath,
  type VaultShelf,
} from "@/content/vault";

export const metadata = {
  title: "Lab / Yousef Turk",
  description: "Writeups, papers, research. Send a page.",
};

function Shelf({ id }: { id: VaultShelf }) {
  const rows = entriesOn(id);
  const empty =
    id === "research"
      ? "Research papers go here once I have one I can stand behind."
      : id === "writeups"
        ? "The first one goes up when I have a pipeline or a notebook I can stand behind. It'll be a page you can read, not a repo."
        : id === "designs"
          ? "Design studies go here once one is worth sending. Credit goes to whoever I learned it from."
          : "Work goes here when it's ready to send.";

  return (
    <section id={id} className="mt-16 scroll-mt-8">
      <h2 className="section">{SHELF_LABEL[id]}</h2>
      {rows.length === 0 ? (
        <div className="mt-8 max-w-[36rem]">
          <p>Nothing here yet</p>
          <p className="mt-2 text-[0.95rem] text-mute" style={{ textWrap: "pretty" }}>
            {empty}
          </p>
        </div>
      ) : (
        <RevealList className="mt-8 space-y-8">
          {rows.map((entry) => (
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
  );
}

export default function LabPage() {
  return (
    <main className="wrap py-16 sm:py-20">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="name text-[2rem]">Lab</h1>
          <p className="mt-4 max-w-[32rem] text-mute">
            The pages I send instead of a GitHub link. Writeups, notebooks,
            pipelines, and the notes behind them.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <OrbMark state="composing" />
          <CloseMark href="/" />
        </div>
      </div>
      <ShareBar
        path="/lab"
        markdown={"# Lab\n\nNotes and projects by Yousef Turk.\n\n{{url}}"}
      />

      <nav aria-label="Contents" className="mt-12">
        <p className="section text-[1rem]">Contents</p>
        <ol className="mt-4 space-y-1 text-[0.9375rem]">
          {TOC_SHELVES.map((id) => (
            <li key={id}>
              <a href={`#${id}`}>{SHELF_LABEL[id]}</a>
            </li>
          ))}
        </ol>
      </nav>

      {TOC_SHELVES.map((id) => (
        <Shelf key={id} id={id} />
      ))}
    </main>
  );
}
