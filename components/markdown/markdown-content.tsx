import { renderMarkdown } from "@/lib/markdown/render";

import { CodeCopyEnhancer } from "./code-copy";

const CONTAINER_ID = "markdown-content";

/**
 * Renders published Markdown. Server-only: the sanitizing pipeline and Shiki
 * both stay out of the browser bundle.
 */
export async function MarkdownContent({ content }: { content: string }) {
  const html = await renderMarkdown(content);

  return (
    <>
      <div
        id={CONTAINER_ID}
        className="prose max-w-none"
        // Safe: `html` comes from lib/markdown/render.ts, which strips raw HTML
        // and runs rehype-sanitize before any highlighting is applied.
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CodeCopyEnhancer containerId={CONTAINER_ID} />
    </>
  );
}
