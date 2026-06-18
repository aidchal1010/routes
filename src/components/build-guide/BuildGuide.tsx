import { highlightCode } from "../map/highlightCode";
import { BUILD_GUIDE, type Block } from "./build-guide-content";

// Static, server-rendered Build Guide document. The whole-system assembly manual that
// the per-element panels deliberately leave out. Prose lives in build-guide-content.ts.

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-mono text-sm uppercase tracking-widest text-ink-400">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

// Renders an ordered list of prose/code blocks for the assembly sections. Routing by fence
// language: "python" goes through highlightCode (the established palette.syntax colors);
// "text" and "shell" render as a plain <pre>, never highlighted. Both <pre> variants share
// the styling used by the File layout / Memory blocks.
const PRE_CLASS =
  "overflow-x-auto rounded-md border border-night-800 bg-night-900 p-4 font-mono text-[12px] leading-relaxed text-ink-100";

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === "p") return <p key={i}>{b.text}</p>;
        if (b.lang === "python") {
          return (
            <pre key={i} className={PRE_CLASS}>
              <code>{highlightCode(b.code)}</code>
            </pre>
          );
        }
        // "text" / "shell": plain <pre>, no highlighter.
        return (
          <pre key={i} className={PRE_CLASS}>
            {b.code}
          </pre>
        );
      })}
    </>
  );
}

export default function BuildGuide() {
  const g = BUILD_GUIDE;

  return (
    <article className="mx-auto max-w-3xl px-6 py-10 text-[14px] leading-relaxed text-terminal">
      <header>
        <h1 className="font-mono text-2xl tracking-wide text-ink-100">
          Build Guide
        </h1>
        <p className="mt-3 text-ink-400">{g.intro.lead}</p>
      </header>

      <Section title="What you're building">
        <p>{g.whatYouBuild.body}</p>
      </Section>

      <Section title="How a request flows">
        <Blocks blocks={g.howRequestFlows.blocks} />
      </Section>

      <Section title="File layout">
        {/* Plain <pre>: box-drawing chars + inline notes must not go through the
            syntax highlighter (the first "#" would be read as a comment). */}
        <pre className={PRE_CLASS}>{g.fileLayout.tree}</pre>
        <p>{g.fileLayout.note}</p>
      </Section>

      <Section title="The prompts">
        <Blocks blocks={g.prompts.blocks} />
      </Section>

      <Section title="Order of assembly">
        <p>{g.assembly.intro}</p>
        <ol className="space-y-2.5">
          {g.assembly.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 font-mono text-[12px] text-ink-400">
                {i + 1}.
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Making it run">
        <Blocks blocks={g.makingItRun.blocks} />
      </Section>

      <Section title="From one loop to the system">
        <Blocks blocks={g.fromLoop.blocks} />
      </Section>

      <Section title="Which models where">
        <p>{g.models.intro}</p>
        <div className="overflow-x-auto rounded-md border border-night-800">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-night-800 text-ink-400">
                <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-widest">
                  Layer
                </th>
                <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-widest">
                  Model
                </th>
                <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-widest">
                  Why
                </th>
              </tr>
            </thead>
            <tbody>
              {g.models.rows.map((row) => (
                <tr
                  key={row.layer}
                  className="border-b border-night-800 last:border-0 align-top"
                >
                  <td className="px-3 py-2.5 font-mono text-ink-100">
                    {row.layer}
                  </td>
                  <td className="px-3 py-2.5">{row.model}</td>
                  <td className="px-3 py-2.5 text-ink-400">{row.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>{g.models.example}</p>
        <p>{g.models.tradeoff}</p>
      </Section>

      <Section title="Vocabulary map">
        <p>{g.vocab.intro}</p>
        <div className="overflow-x-auto rounded-md border border-night-800">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-night-800 text-ink-400">
                <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-widest">
                  In this world
                </th>
                <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-widest">
                  In the sources
                </th>
                <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-widest">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              {g.vocab.rows.map((row) => (
                <tr
                  key={row.ours}
                  className="border-b border-night-800 last:border-0 align-top"
                >
                  <td className="px-3 py-2.5 font-mono text-ink-100">
                    {row.ours}
                  </td>
                  <td className="px-3 py-2.5">{row.theirs}</td>
                  <td className="px-3 py-2.5 text-ink-400">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="The no-peer-coordination rule">
        <p>{g.noPeer.body}</p>
      </Section>

      <Section title="Memory">
        <p>{g.memory.body}</p>
        <pre className={PRE_CLASS}>
          <code>{highlightCode(g.memory.code)}</code>
        </pre>
        <p className="text-ink-400">{g.memory.note}</p>
      </Section>

      <Section title="Building with AI assistance">
        <p>{g.aiAssist.body}</p>
        <p className="text-ink-400">{g.aiAssist.metaNote}</p>
      </Section>

      <Section title="References">
        <ul className="space-y-1">
          {g.references.map((ref) => (
            <li key={ref.url}>
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orchestratorLight underline"
              >
                {ref.label}
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </article>
  );
}
