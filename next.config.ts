import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
    allowedDevOrigins: ["192.168.4.119", "172.17.128.1"],
};

export default nextConfig;
