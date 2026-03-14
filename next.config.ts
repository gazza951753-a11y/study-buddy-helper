import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "study-buddy-helper";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // GitHub Pages serves from /<repo>/ — assets must use the same prefix
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
