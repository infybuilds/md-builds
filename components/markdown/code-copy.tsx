"use client";

import { useEffect } from "react";

const RESET_DELAY_MS = 1500;

/**
 * Adds a Copy button to every code block inside `containerId`.
 *
 * Takes an element id rather than children so the rendered article HTML is not
 * also serialized into the client payload — it stays purely server-rendered, and
 * this component ships a few lines of JS instead of a copy of the page.
 */
export function CodeCopyEnhancer({ containerId }: { containerId: string }) {
  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;

    for (const block of root.querySelectorAll<HTMLElement>(".code-block")) {
      if (block.querySelector(".code-copy")) continue;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = "Copy";
      block.append(button);
    }

    let timer: ReturnType<typeof setTimeout> | undefined;

    const handleClick = async (event: MouseEvent) => {
      const button = (event.target as HTMLElement | null)?.closest(
        ".code-copy",
      ) as HTMLButtonElement | null;
      if (!button) return;

      const code = button
        .closest(".code-block")
        ?.querySelector("pre")?.textContent;
      if (!code) return;

      try {
        await navigator.clipboard.writeText(code);
        button.textContent = "Copied";
      } catch {
        // Clipboard access needs a secure context and can be blocked outright.
        button.textContent = "Press ⌘/Ctrl+C";
      }

      clearTimeout(timer);
      timer = setTimeout(() => {
        button.textContent = "Copy";
      }, RESET_DELAY_MS);
    };

    root.addEventListener("click", handleClick);

    return () => {
      clearTimeout(timer);
      root.removeEventListener("click", handleClick);
    };
  }, [containerId]);

  return null;
}
