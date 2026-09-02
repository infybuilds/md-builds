/**
 * Emits a JSON-LD block for search engines.
 *
 * The payload goes in through `dangerouslySetInnerHTML` rather than as a text
 * child because React HTML-escapes text, and `&lt;` inside a `<script>` is not
 * unescaped by the browser — it would corrupt the JSON. Rewriting `<` as the
 * JSON escape sequence is the part that matters for safety: a document title
 * containing `</script>` would otherwise close the tag early and turn content
 * into markup.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
