import Link from "next/link";
import { NavLiquid } from "@/components/NavLiquid";
import { OrbMark } from "@/components/OrbMark";
import { RevealList } from "@/components/RevealList";
import { TyperLine } from "@/components/arlan/TyperLine";
import { SocialLinks } from "@/components/SocialLinks";
import { WritingBtn } from "@/components/WritingBtn";
import { experiences, stark } from "@/content/home";
import { projects, vaultPath, writeups } from "@/content/vault";

export default function Home() {
  return (
    <main className="wrap pb-16 pt-8 sm:pb-20 sm:pt-10">
      <header className="grid items-start gap-8 sm:grid-cols-[1fr_auto]">
        <div>
          <h1 className="name text-[2rem] sm:text-[2.35rem]">
            <TyperLine text="Yousef Turk" />
          </h1>
          <p className="mt-5 max-w-[36rem]">
            I&apos;m in grade 12 at Liwa in Abu Dhabi. I work on AI for science,
            and I like startups, usually in the same week. I&apos;m applying to
            MBZUAI. This summer I was at NYUAD for a robotics program and at
            MBZUAI for a five day bootcamp.
          </p>
          <p className="mt-4 max-w-[36rem]">
            The math is the part I actually care about. Not the demo, the
            tensors underneath it, down to the last matrix. I use the tools all
            day and I still want to know what they&apos;re doing. Jensen Huang
            said you won&apos;t lose your job to an AI, you&apos;ll lose it to
            someone who uses AI. I&apos;d rather be the second person.
          </p>
          <p className="mt-4 max-w-[36rem]">
            What I want to build sits where AI, science, and design meet. A
            model that predicts a cell&apos;s next state is half the job. The
            other half is the thing a researcher opens on a Tuesday and
            understands in ten seconds. I work on both sides, and I think the
            second one is why most good research goes unused.
          </p>
          <p className="mt-4 max-w-[36rem]">
            AI is nowhere near finished. Most of what it can do for a lab
            hasn&apos;t been built yet, and nobody is going to hand me the
            assignment. So I don&apos;t wait to be picked. I enter the thing
            I&apos;m underqualified for, then close the gap before the deadline.
            That&apos;s how our school team beat university undergrads at Abu
            Dhabi University, and how the gene editing paper below got written
            without a lab.
          </p>
          <p className="mt-4 max-w-[36rem]">
            Lab is the page I send people. Writing is the notes.
          </p>
          <p className="mt-4 max-w-[36rem]">
            I love Marvel, and Tony Stark most of all. I see a lot of myself in
            him. He builds the first version in a cave with scraps, gets it
            working, then goes home and does it properly. That&apos;s usually my
            week.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <NavLiquid />
            <WritingBtn />
          </div>
          <SocialLinks />
        </div>
        <OrbMark state="breathing" portrait />
      </header>

      <figure className="still mt-14 max-w-[36rem]">
        <img
          src={stark.still}
          alt={stark.stillAlt}
          width={1024}
          height={539}
          loading="lazy"
          decoding="async"
        />
        <blockquote className="quote mt-5">
          <p>{stark.line}</p>
          <footer>{stark.from}</footer>
        </blockquote>
      </figure>

      <section className="mt-16 max-w-[36rem]">
        <h2 className="section">Writeups</h2>
        {writeups.length === 0 ? (
          <>
            <p className="mt-8" style={{ textWrap: "pretty" }}>
              Nothing here yet. The first one goes up when I have a pipeline or
              a notebook I can stand behind. It&apos;ll be a page, not a repo.
              You get a URL. I don&apos;t send GitHub.
            </p>
            <p className="links mt-2">
              (<Link href="/lab#writeups">lab</Link>)
            </p>
          </>
        ) : (
          <RevealList className="mt-8 space-y-8">
            {writeups.map((entry) => (
              <li key={entry.slug}>
                <h3 className="name text-[1.05rem] leading-snug">{entry.title}</h3>
                <p className="mt-1 text-[0.95rem]">{entry.date}</p>
                <p
                  className="mt-2 max-w-[36rem] text-[0.95rem]"
                  style={{ textWrap: "pretty" }}
                >
                  {entry.blurb}
                </p>
                <p className="links mt-1">
                  (<Link href={vaultPath(entry.slug)}>lab</Link>)
                </p>
              </li>
            ))}
          </RevealList>
        )}
      </section>

      <section className="mt-16">
        <h2 className="section">Experiences</h2>
        <RevealList className="mt-8 space-y-8">
          {experiences.map((row) => (
            <li key={row.title}>
              <h3 className="name text-[1.05rem] leading-snug">{row.title}</h3>
              <p className="mt-1 text-[0.95rem]">{row.who}</p>
              <p
                className="mt-2 max-w-[36rem] text-[0.95rem]"
                style={{ textWrap: "pretty" }}
              >
                {row.detail}
              </p>
              {row.href && row.link ? (
                <p className="links mt-1">
                  (
                  {row.href.startsWith("http") ? (
                    <a href={row.href} rel="noreferrer">
                      {row.link}
                    </a>
                  ) : (
                    <Link href={row.href}>{row.link}</Link>
                  )}
                  )
                </p>
              ) : null}
            </li>
          ))}
        </RevealList>
      </section>

      <section className="mt-16 max-w-[36rem]">
        <h2 className="section">Campus</h2>
        <p className="mt-8" style={{ textWrap: "pretty" }}>
          I want to be a campus ambassador at Liwa. The robotics team needs
          sponsors. We already build with Claude Code and Codex. What we
          don&apos;t have is a 3D printer, and we need one badly. If you run an
          education or ambassador program, or you can send a printer, email me.
        </p>
        <p className="links mt-2">
          (
          <a href="mailto:hello@yousefturk.com">E-Mail</a>
          )
        </p>
      </section>

      <section className="mt-16 max-w-[36rem]">
        <h2 className="section">Learning</h2>
        <p className="mt-8" style={{ textWrap: "pretty" }}>
          Python, PyTorch, Git. At NYUAD I used MuJoCo and Isaac Sim on the
          robot. Gymnasium when I train an agent. Hugging Face when someone has
          already trained the model I need. I don&apos;t know Julia or Rust. I
          don&apos;t have a wet lab.
        </p>
      </section>

      {projects.length > 0 && (
        <section className="mt-16">
          <h2 className="section">Research</h2>
          <RevealList className="mt-8 space-y-8">
            {projects.map((entry) => (
              <li key={entry.slug}>
                <h3 className="name text-[1.05rem] leading-snug">{entry.title}</h3>
                <p className="mt-1 text-[0.95rem]">
                  <span className="own">{entry.authors}</span>
                </p>
                {entry.venue && <p className="meta mt-1">{entry.venue}</p>}
                <p className="links mt-1">
                  (<Link href={vaultPath(entry.slug)}>lab</Link>)
                </p>
              </li>
            ))}
          </RevealList>
        </section>
      )}
    </main>
  );
}
