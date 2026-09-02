"use client";

import { Eye, FileUp, PencilLine, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Same reasoning as the admin editor: react-markdown and its unified chain are
 * only needed once the page is interactive, so they stay out of the server
 * bundle and out of the initial payload.
 */
const MarkdownPreview = dynamic(
  () =>
    import("@/components/markdown/markdown-preview").then(
      (mod) => mod.MarkdownPreview,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-muted-foreground text-sm">Loading preview…</p>
    ),
  },
);

/**
 * Guard against opening something that is not really a document. A .md file big
 * enough to matter is a few hundred kilobytes; past this a textarea re-render on
 * every keystroke stops being usable, so refusing is kinder than hanging.
 */
const MAX_FILE_BYTES = 2 * 1024 * 1024;

const ACCEPT = ".md,.markdown,.mdown,.mkd,.mdx,.txt,text/markdown,text/plain";

const EXAMPLE = `# Markdown viewer

Paste Markdown on the left, read it on the right. **Nothing leaves your browser.**

## What it handles

- GitHub Flavored Markdown, including ~~strikethrough~~ and task lists
- [Links](https://md.infybuilds.com), \`inline code\` and images
- Tables:

| Syntax      | Renders as     |
| ----------- | -------------- |
| \`**bold**\`  | **bold**       |
| \`_italic_\`  | _italic_       |

## Fenced code

\`\`\`ts
export function greet(name: string) {
  return \`Hello, \${name}\`;
}
\`\`\`

> Blockquotes work too.

1. Ordered lists
2. Nested lists
   - like this
`;

type Pane = "write" | "preview";

export function MarkdownViewer() {
  const [content, setContent] = useState("");
  const [pane, setPane] = useState<Pane>("write");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function openFile(file: File) {
    setError(null);

    if (file.size > MAX_FILE_BYTES) {
      setError(
        `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 2 MB.`,
      );
      return;
    }

    try {
      // Read in the browser: the file is never sent anywhere.
      const text = await file.text();
      setContent(text);
      setFileName(file.name);
      setPane("preview");
    } catch {
      setError(`Could not read ${file.name}.`);
    }
  }

  return (
    <div className="mt-8">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInput.current?.click()}
        >
          <FileUp className="size-3.5" />
          Open .md file
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void openFile(file);
            // Reset, so re-opening the same file fires another change event.
            event.target.value = "";
          }}
        />

        {content.length === 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setContent(EXAMPLE);
              setPane("preview");
            }}
          >
            Load an example
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setContent("");
              setFileName(null);
              setError(null);
              setPane("write");
            }}
          >
            <Trash2 className="size-3.5" />
            Clear
          </Button>
        )}

        {fileName ? (
          <span className="text-muted-foreground truncate text-xs">
            {fileName}
          </span>
        ) : null}

        <div className="ml-auto flex items-center gap-1 lg:hidden">
          {(
            [
              { value: "write", label: "Paste", icon: PencilLine },
              { value: "preview", label: "Read", icon: Eye },
            ] as const
          ).map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={pane === option.value ? "outline" : "ghost"}
              className="h-7 px-2.5 text-xs"
              aria-pressed={pane === option.value}
              onClick={() => setPane(option.value)}
            >
              <option.icon className="size-3.5" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-destructive mb-3 text-sm">
          {error}
        </p>
      ) : null}

      <div
        className="grid gap-4 lg:grid-cols-2"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          const file = event.dataTransfer.files?.[0];
          if (!file) return;
          event.preventDefault();
          void openFile(file);
        }}
      >
        <div className={cn(pane === "preview" && "hidden lg:block")}>
          <label htmlFor="markdown-input" className="sr-only">
            Markdown source
          </label>
          <Textarea
            id="markdown-input"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={24}
            spellCheck={false}
            placeholder="Paste Markdown here, or drop a .md file anywhere in this area…"
            className="min-h-[26rem] resize-y font-mono text-[13px] leading-relaxed"
          />
        </div>

        <div
          className={cn(
            "bg-muted/30 min-h-[26rem] overflow-auto rounded-md border p-5",
            pane === "write" && "hidden lg:block",
          )}
        >
          {content.trim().length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Your rendered Markdown will appear here.
            </p>
          ) : (
            <MarkdownPreview content={content} />
          )}
        </div>
      </div>
    </div>
  );
}
