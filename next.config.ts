import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Pin the project root. Without this, Turbopack walks up and finds an
  // unrelated package-lock.json in the home folder and warns about it.
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

// `next dev` is not the Workers runtime and so has no bindings of its own.
// This hands it a local D1 database, kept in .wrangler/state, so the site
// behaves the same locally as it does deployed.
if (process.env.NODE_ENV === "development") {
  void initOpenNextCloudflareForDev();
}

export default nextConfig;
