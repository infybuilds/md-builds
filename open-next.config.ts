import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/**
 * R2 backs the incremental cache so a publish invalidates pages for every
 * reader, not just the isolate that handled the mutation. See wrangler.jsonc for
 * the bucket binding.
 */
const config = defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});

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
