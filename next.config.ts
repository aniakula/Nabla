import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse reads test files at require-time; keep it in the Node.js bundle
  // rather than letting Next.js try to trace/bundle it for the edge.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
