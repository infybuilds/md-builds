import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * No `incrementalCache` override is configured, so rendered pages are not
 * persisted between requests.
 *
 * That is a deliberate trade for zero infrastructure: R2 needs a paid
 * subscription, and after making the index pages `force-dynamic` the only routes
 * a page cache could serve are /docs/[slug] and /workshops/[slug]. Their cost is
 * one Supabase query plus a Markdown render. See wrangler.jsonc for how to add
 * Workers KV as a cache without an R2 subscription.
 */
const config = defineCloudflareConfig();

/**
 * Invoke the Next CLI directly rather than the package manager's `build` script.
 *
 * OpenNext defaults to running `npm run build`, and `npm run build` here runs
 * OpenNext — which recurses until the machine gives up. Pinning the command lets
 * `npm run build` be the single build entry point, so Cloudflare's default build
 * command works with no dashboard configuration.
 */
config.buildCommand = "npx next build";

export default config;
