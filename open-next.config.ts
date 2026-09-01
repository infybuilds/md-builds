import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/**
 * R2 backs the incremental cache so a publish invalidates the page for every
 * reader, not just the isolate that handled the mutation. See wrangler.jsonc for
 * the bucket binding.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
