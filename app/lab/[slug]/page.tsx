import { notFound } from "next/navigation";
import { CloseMark } from "@/components/CloseMark";
import { Figure } from "@/components/Figure";
import { Playground } from "@/components/Playground";
import { ShareBar } from "@/components/ShareBar";
import { readFigure } from "@/lib/figures";
import {
  entryBySlug,
  entryMarkdown,
  SHELF_KICKER,
  vault,
  labPath,
} from "@/content/vault";

export function generateStaticParams() {
  return vault.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = entryBySlug(slug);
  if (!entry) return { title: "Lab" };
  return {
    title: `${entry.title} / Yousef Turk`,
    description: entry.blurb,
  };
}

export default async function LabStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = entryBySlug(slug);
  if (!entry) notFound();

  const path = labPath(entry.slug);

  return (
    <main className="wrap py-16 sm:py-20">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[0.8125rem] uppercase tracking-[0.12em] text-mute">
            {SHELF_KICKER[entry.shelf]}
          </p>
          <h1 className="name mt-2 text-[2rem]">{entry.title}</h1>
        </div>
        <CloseMark href="/lab" />
      </div>

      <ShareBar path={path} markdown={entryMarkdown(entry, "{{url}}")} />

      <div className="mt-8 max-w-[36rem] space-y-4" style={{ textWrap: "pretty" }}>
        {entry.body.map((p, i) => {
          const figures = (entry.figures ?? []).filter((f) => f.after === i);
          return (
            <div key={p} className="space-y-4">
              <p>{p}</p>
              {figures.map((f) => {
                const svg = readFigure(f.file);
                if (!svg) return null;
                return (
                  <Figure
                    key={f.file}
                    svg={svg}
                    caption={f.caption}
                    source={f.source}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {entry.links.some((l) => l.label !== "lab") && (
        <p className="links mt-6">
          {entry.links
            .filter((l) => l.label !== "lab")
            .map((l) => (
              <span key={l.href}>
                (
                <a href={l.href} rel={l.href.startsWith("http") ? "noreferrer" : undefined}>
                  {l.label}
                </a>
                ){" "}
              </span>
            ))}
        </p>
      )}

      {entry.playground && (
        <section className="mt-12">
          <h2 className="section text-[1rem]">Playground</h2>
          <div className="mt-6">
            <Playground kind={entry.playground} />
          </div>
        </section>
      )}

      <section className="mt-12 border-t border-line pt-6">
        <h2 className="section text-[1rem]">Credits</h2>
        <table className="mt-4 w-full max-w-[28rem] text-left text-[0.9375rem]">
          <tbody>
            <tr>
              <th className="py-1.5 pr-6 font-normal text-mute">Kind</th>
              <td>{SHELF_KICKER[entry.shelf]}</td>
            </tr>
            <tr>
              <th className="py-1.5 pr-6 font-normal text-mute">Date</th>
              <td>{entry.date}</td>
            </tr>
            <tr>
              <th className="py-1.5 pr-6 font-normal text-mute">Tags</th>
              <td>{entry.tags.join(", ")}</td>
            </tr>
            {entry.credit && (
              <tr>
                <th className="py-1.5 pr-6 font-normal text-mute">Source</th>
                <td>
                  <a href={entry.credit.href}>{entry.credit.source}</a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {entry.credit && (
        <p className="mt-10 text-[0.9375rem] text-mute">
          After <a href={entry.credit.href}>{entry.credit.source}</a>.
        </p>
      )}
    </main>
  );
}
