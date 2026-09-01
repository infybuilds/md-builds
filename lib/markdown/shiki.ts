import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { Element, Root, RootContent } from "hast";

// Fine-grained imports rather than shiki's full bundle: only these grammars end
// up in the deployment artifact, which matters on Cloudflare Workers where the
// whole app ships as one worker.
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import diff from "shiki/langs/diff.mjs";
import html from "shiki/langs/html.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import jsx from "shiki/langs/jsx.mjs";
import markdown from "shiki/langs/markdown.mjs";
import php from "shiki/langs/php.mjs";
import sql from "shiki/langs/sql.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import yaml from "shiki/langs/yaml.mjs";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";

const LANGUAGES = [
  bash,
  css,
  diff,
  html,
  javascript,
  json,
  jsx,
  markdown,
  php,
  sql,
  tsx,
  typescript,
  yaml,
];

/** Emits light colours inline plus `--shiki-dark` custom properties. */
const THEMES = { light: "github-light", dark: "github-dark" } as const;

/**
 * Aliases people actually type in fences, mapped to the grammars loaded above.
 * Anything not listed renders as plain text rather than failing.
 */
const ALIASES: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  js: "javascript",
  ts: "typescript",
  yml: "yaml",
  md: "markdown",
  htm: "html",
  postgres: "sql",
  postgresql: "sql",
  mysql: "sql",
};

// One highlighter per isolate; the promise is memoized, not the resolved value.
let highlighterPromise: Promise<HighlighterCore> | undefined;

function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
    themes: [githubLight, githubDark],
    langs: LANGUAGES,
    // The JavaScript regex engine, not Oniguruma. Cloudflare Workers refuse to
    // compile WebAssembly at runtime ("Wasm code generation disallowed by
    // embedder"), which is what the default engine does. `forgiving` skips the
    // few regex patterns this engine cannot express instead of throwing.
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  });
  return highlighterPromise;
}

/**
 * Resolves a fence's language hint to a loaded grammar. Unknown hints degrade to
 * plain text — an admin's typo in a fence must never take a published page down.
 */
function resolveLanguage(
  highlighter: HighlighterCore,
  requested: string,
): string {
  const hint = requested.trim().toLowerCase();
  if (!hint) return "text";

  const candidate = ALIASES[hint] ?? hint;
  return highlighter.getLoadedLanguages().includes(candidate)
    ? candidate
    : "text";
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

/** Collects every `<pre><code>` pair without mutating the tree. */
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
 * Rehype transformer that swaps fenced code blocks for Shiki output wrapped in a
 * `<figure data-language>`, giving the client-side copy button something stable
 * to attach to.
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

    for (const block of blocks) {
      const language = resolveLanguage(highlighter, block.language);
      const highlighted = highlighter.codeToHast(block.code, {
        lang: language,
        themes: THEMES,
      });

      const pre = highlighted.children.find(
        (child): child is Element => child.type === "element",
      );

      block.parent.children[block.index] = {
        type: "element",
        tagName: "figure",
        properties: {
          className: ["code-block"],
          "data-language": language === "text" ? undefined : language,
        },
        children: pre ? [pre] : [],
      };
    }
  };
}
