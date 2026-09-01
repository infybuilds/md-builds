"use client";

import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

/**
 * Live preview for the admin editor.
 *
 * Deliberately not the server pipeline from `lib/markdown/render.ts`: this runs
 * on every keystroke, so it skips Shiki (which would mean shipping a highlighter
 * and its grammars to the browser). Structure, tables, lists and links match the
 * published page exactly; fenced code is styled but not colour-highlighted here.
 *
 * `rehype-sanitize` is applied anyway — the preview must never execute what an
 * admin pastes in.
 */
export function MarkdownPreview({ content }: { content: string }) {
  if (content.trim().length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nothing to preview yet. Start typing Markdown on the left.
      </p>
    );
  }

  return (
    <div className="prose max-w-none">
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </Markdown>
    </div>
  );
}
