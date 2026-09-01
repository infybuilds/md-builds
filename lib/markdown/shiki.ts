import { bundledLanguages, createHighlighter, type Highlighter } from "shiki";
import type { BundledLanguage } from "shiki";
import type { Element, Root, RootContent } from "hast";

/**
 * Languages loaded up front — the set the workshop material actually uses.
 * Anything else is loaded on demand in `resolveLanguage`.
 */
const PRELOADED_LANGUAGES = [
  "bash",
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "php",
  "sql",
  "json",
  "html",
  "css",
  "markdown",
  "yaml",
  "diff",
] satisfies BundledLanguage[];

/** Emits light colours inline plus `--shiki-dark` custom properties. */
const THEMES = { light: "github-light", dark: "github-dark" } as const;

// One highlighter per server process: loading the WASM engine and grammars is
// expensive, so the promise is memoized rather than the resolved value.
let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: [THEMES.light, THEMES.dark],
    langs: [...PRELOADED_LANGUAGES],
  });
  return highlighterPromise;
}

/**
 * Maps a fence's language hint onto something Shiki can actually highlight.
 * Unknown hints degrade to plain text instead of throwing — an admin typo in a
 * fence must never take a published page down.
 */
async function resolveLanguage(
  highlighter: Highlighter,
  requested: string,
): Promise<string> {
  const lang = requested.trim().toLowerCase();

  if (!lang || lang === "text" || lang === "plaintext" || lang === "txt") {
    return "text";
  }
  if (highlighter.getLoadedLanguages().includes(lang)) {
    return lang;
  }
  if (lang in bundledLanguages) {
    try {
      await highlighter.loadLanguage(lang as BundledLanguage);
      return lang;
    } catch {
      return "text";
    }
  }
  return "text";
}

type ParentNode = { children: RootContent[] };

type PendingBlock = {
  parent: ParentNode;
  index: number;
  language: string;
  code: string;
};

function textContent(node: RootContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(textContent).join("");
  return "";
}

function languageFromClassName(code: Element): string {
  const className = code.properties?.className;
  const classes = Array.isArray(className) ? className : [className];

  for (const entry of classes) {
    if (typeof entry === "string" && entry.startsWith("language-")) {
      return entry.slice("language-".length);
    }
  }
  return "";
}

/** Collects every `<pre><code>` pair, deepest-last, without mutating the tree. */
function collectCodeBlocks(node: ParentNode, out: PendingBlock[]): void {
  node.children.forEach((child, index) => {
    if (child.type !== "element") return;

    if (child.tagName === "pre") {
      const code = child.children.find(
        (grandChild): grandChild is Element =>
          grandChild.type === "element" && grandChild.tagName === "code",
      );
      if (code) {
        out.push({
          parent: node,
          index,
          language: languageFromClassName(code),
          code: textContent(code).replace(/\n$/, ""),
        });
        return;
      }
    }

    collectCodeBlocks(child, out);
  });
}

/**
 * Rehype transformer that swaps fenced code blocks for Shiki output wrapped in
 * a `<figure data-language>` so the client-side copy button has something
 * stable to attach to.
 *
 * Must run *after* rehype-sanitize: Shiki's inline styles and span classes are
 * generated from already-sanitized text, so the sanitizer never has to be
 * loosened to accommodate them.
 */
export function rehypeShiki() {
  return async (tree: Root): Promise<void> => {
    const blocks: PendingBlock[] = [];
    collectCodeBlocks(tree, blocks);

    if (blocks.length === 0) return;

    const highlighter = await getHighlighter();

    const replacements = await Promise.all(
      blocks.map(async (block) => {
        const language = await resolveLanguage(highlighter, block.language);
        const highlighted = highlighter.codeToHast(block.code, {
          lang: language,
          themes: THEMES,
        });

        const pre = highlighted.children.find(
          (child): child is Element => child.type === "element",
        );

        const figure: Element = {
          type: "element",
          tagName: "figure",
          properties: {
            className: ["code-block"],
            "data-language": language === "text" ? undefined : language,
          },
          children: pre ? [pre] : [],
        };

        return { block, figure };
      }),
    );

    for (const { block, figure } of replacements) {
      block.parent.children[block.index] = figure;
    }
  };
}
