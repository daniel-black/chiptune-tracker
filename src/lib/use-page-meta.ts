import { useEffect } from "react";

export const DEFAULT_TITLE =
  "Chiptunes – Make 8-bit chiptune music in your browser";

/**
 * Sets the tab title, and optionally asks search engines not to index the
 * page (song editors and share links only make sense in one browser).
 * Restores the defaults when the page unmounts.
 */
export function usePageMeta({
  title,
  noindex = false,
}: {
  title?: string;
  noindex?: boolean;
}) {
  useEffect(() => {
    // No title: leave it to whichever page sets one (e.g. a nested 404)
    if (!title) return;
    document.title = `${title} – Chiptunes`;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);

  useEffect(() => {
    if (!noindex) return;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [noindex]);
}
