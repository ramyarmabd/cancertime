import type { NextConfig } from "next";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const isAccountSite = repository?.toLowerCase() === `${owner?.toLowerCase()}.github.io`;
const basePath = isGitHubPagesBuild && repository && !isAccountSite
  ? `/${repository}`
  : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  basePath,
};

export default nextConfig;
