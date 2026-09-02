import type { Metadata } from "next";
import { BookOpen, FileText, Lock, Zap } from "lucide-react";
import Link from "next/link";

import { AdSlot } from "@/components/ads/ad-slot";
import { MarkdownViewer } from "@/components/markdown/markdown-viewer";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, webApplicationSchema } from "@/lib/seo/schema";
import { OG_DEFAULTS, SITE_NAME } from "@/lib/seo/site";

const TITLE = "Markdown Viewer — Open & Read .md Files Online";

const DESCRIPTION =
  "Free online Markdown viewer. Paste Markdown or open a .md file and read it rendered instantly — GitHub Flavored Markdown, tables and code, all in your browser.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/viewer" },
  openGraph: {
    ...OG_DEFAULTS,
    type: "website",
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: "/viewer",
  },
};

/**
 * Rendered on demand, like the rest of the public pages. This one needs no
 * database, but a build-time render would resolve the canonical URL against the
 * `metadataBase` in the root layout — and `SITE_URL` is a Cloudflare runtime
 * variable, so that would bake `http://localhost:3000/viewer` into the HTML.
 */
export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: Lock,
    title: "Nothing is uploaded",
    body: "Rendering happens in your browser. The file you open never leaves your machine, so there is nothing to delete afterwards.",
  },
  {
    icon: Zap,
    title: "GitHub Flavored Markdown",
    body: "Tables, task lists, strikethrough, autolinks and fenced code blocks all render the way they do on GitHub.",
  },
  {
    icon: FileText,
    title: "Any .md file",
    body: "Open .md, .markdown, .mdx or .txt from your computer, or drop it straight onto the editor. Paste works too.",
  },
];

const FAQ = [
  {
    question: "What is a .md file?",
    answer:
      "A .md file is a plain text file written in Markdown, a lightweight syntax for formatting text with symbols instead of buttons — # for a heading, ** for bold, - for a list item. Because it is just text, it opens in any editor; a viewer like this one shows you the formatting it describes.",
  },
  {
    question: "How do I open a .md file without installing anything?",
    answer:
      "Use the Open .md file button above, or drag the file onto the editor area. It is read locally by your browser and rendered on the spot, so there is no software to install and no account to create.",
  },
  {
    question: "Is my Markdown sent to a server?",
    answer:
      "No. The renderer runs as JavaScript in your own browser, so the text you paste and the files you open stay on your device. You can confirm it by opening this page, disconnecting from the network and pasting some Markdown — it still renders.",
  },
  {
    question: "Which Markdown syntax is supported?",
    answer:
      "GitHub Flavored Markdown: headings, emphasis, links, images, blockquotes, ordered and unordered lists, task lists, tables, strikethrough, inline code and fenced code blocks. Raw HTML inside the Markdown is stripped rather than executed, which is what keeps pasting someone else's file safe.",
  },
  {
    question: "Can I read Markdown on a phone?",
    answer:
      "Yes. On a narrow screen the Paste and Read tabs swap between the source and the rendered output; on a wide screen they sit side by side.",
  },
];

export default function ViewerPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
      <JsonLd
        data={webApplicationSchema({
          name: "Markdown Viewer",
          description: DESCRIPTION,
          path: "/viewer",
          featureList: FEATURES.map((feature) => feature.title),
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Markdown viewer", path: "/viewer" },
        ])}
      />

      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Markdown viewer
      </h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
        Paste Markdown or open a <code>.md</code> file and read it rendered
        straight away. It runs entirely in your browser — no upload, no account,
        no install.
      </p>

      <MarkdownViewer />

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">
          What this viewer does
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-lg border p-5">
              <feature.icon className="text-muted-foreground size-4" />
              <h3 className="mt-3 text-sm font-medium">{feature.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <AdSlot placement="article-bottom" className="mt-12" />

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">
          Questions people ask
        </h2>
        <div className="mt-6 divide-y border-y">
          {FAQ.map((item) => (
            <div key={item.question} className="py-5">
              <h3 className="text-sm font-medium">{item.question}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">
          Markdown written up properly
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          This viewer is the quick way to read a file. The guides and workshops
          are the long way round — and free either way.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/docs"
            className="hover:border-foreground/30 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <FileText className="size-4" />
            Browse the guides
          </Link>
          <Link
            href="/workshops"
            className="hover:border-foreground/30 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <BookOpen className="size-4" />
            Browse the workshops
          </Link>
        </div>
      </section>
    </div>
  );
}
