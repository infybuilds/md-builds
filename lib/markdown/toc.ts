import GithubSlugger from "github-slugger";
import type { Heading, Node, Parent, Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

export type TocEntry = {
  id: string;
  text: string;
  depth: 2 | 3;
};

const parser = unified().use(remarkParse).use(remarkGfm);

function isParent(node: Node): node is Parent {
  return "children" in node && Array.isArray((node as Parent).children);
}

/** Flattens a heading's inline content (emphasis, inline code, links) to text. */
function headingText(node: Node): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  if (isParent(node)) return node.children.map(headingText).join("");
  return "";
}

/** Every heading in document order, including ones nested in lists or quotes. */
function collectHeadings(node: Node, out: Heading[]): void {
  if (node.type === "heading") {
    out.push(node as Heading);
    return;
  }
  if (isParent(node)) {
    for (const child of node.children) collectHeadings(child, out);
  }
}

/**
 * Builds the "On this page" list from h2/h3 headings.
 *
 * Slugs *every* heading in document order — the same algorithm (github-slugger)
 * and the same sequence rehype-slug uses in `render.ts` — so these ids match the
 * anchors in the rendered HTML even when two headings share a title.
 */
export function buildToc(markdown: string): TocEntry[] {
  const tree = parser.parse(markdown) as Root;
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];
  const headings: Heading[] = [];

  collectHeadings(tree, headings);

  for (const heading of headings) {
    const text = headingText(heading).trim();
    const id = slugger.slug(text);

    if (heading.depth === 2 || heading.depth === 3) {
      entries.push({ id, text, depth: heading.depth });
    }
  }

  return entries;
}
