import { getTranslations } from "next-intl/server";

import { CodeBlock } from "@/components/blog/code-block";
import type { ArticleBlock, ArticleSection } from "@/lib/article-content";

type ArticleBodyProps = {
  sections: readonly ArticleSection[];
};

/** Corpo do artigo: uma secao numerada por vez, blocos na ordem do banco. */
export function ArticleBody({ sections }: ArticleBodyProps) {
  return (
    <div className="min-w-0 max-w-[46rem]">
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-title`}
          className="article-section scroll-mt-24 border-t border-border py-12 first:border-t-0 first:pt-0 lg:py-16"
        >
          <p className="font-mono text-xs tracking-[0.22em] text-flare tabular-nums">
            {section.number}
          </p>
          <h2
            id={`${section.id}-title`}
            className="display mt-3 text-[clamp(2.1rem,4.4vw,3.6rem)] leading-[0.95] font-semibold text-balance"
          >
            {section.title}
          </h2>
          <div className="mt-8 space-y-6">
            {section.blocks.map((block, index) => (
              <Block key={index} block={block} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

async function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h3 className="display pt-4 text-[clamp(1.5rem,2.6vw,2rem)] font-semibold">
          {block.text}
        </h3>
      );
    case "paragraph":
      return (
        <p
          id={block.id}
          className="text-[1.0625rem] leading-[1.9] text-foreground/85 lg:text-[1.125rem]"
        >
          {block.text}
        </p>
      );
    case "code":
      return (
        <CodeBlock
          code={block.code}
          language={block.language}
          filename={block.filename}
        />
      );
    case "quote":
      return (
        <figure className="my-12 border-t border-border-strong pt-6">
          <blockquote className="display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.02] font-semibold text-lavender text-balance normal-case">
            {block.text}
          </blockquote>
          {block.author ? (
            <figcaption className="mt-5 flex flex-wrap gap-x-4 font-mono text-[0.68rem] tracking-[0.18em] text-subtle-foreground uppercase">
              <span>{block.author}</span>
              {block.year ? (
                <span className="tabular-nums">{block.year}</span>
              ) : null}
            </figcaption>
          ) : null}
        </figure>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List
          className={`space-y-3 pl-6 text-[1.0625rem] leading-[1.8] text-foreground/85 marker:font-mono marker:text-flare lg:text-[1.125rem] ${block.ordered ? "list-decimal" : "list-disc"}`}
        >
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
      );
    }
    case "image":
      return (
        <figure className="my-10">
          {/* Host de imagem ainda indefinido: sem `remotePatterns` o next/image recusa. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            className="w-full border border-border"
          />
          {block.caption ? (
            <figcaption className="mt-3 font-mono text-[0.68rem] tracking-[0.18em] text-subtle-foreground uppercase">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    case "callout": {
      const t = await getTranslations("Blog");
      return (
        <aside className="border border-border-strong bg-card p-5">
          <p className="font-mono text-[0.68rem] tracking-[0.18em] text-lavender uppercase">
            {block.title ?? t("note")}
          </p>
          <p className="mt-3 text-base leading-8 text-foreground/85">
            {block.text}
          </p>
        </aside>
      );
    }
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}
