import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { rehypeShiki } from "./shiki";

/**
 * The single source of truth for how published Markdown becomes HTML.
 *
 * Security notes:
 *  - `remark-rehype` runs without `allowDangerousHtml`, so raw HTML in the
 *    source never reaches the tree in the first place.
 *  - `rehype-sanitize` (GitHub's default schema) is the second line of defence,
 *    and runs *before* highlighting so Shiki's own markup needs no allowances.
 *  - `rehype-slug` runs after sanitizing, so heading anchors survive the
 *    sanitizer's id clobbering while still being derived from text, not input
 *    HTML.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeSlug)
  .use(rehypeShiki)
  .use(rehypeStringify);

/** Server-only: renders Markdown to sanitized HTML. */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}
