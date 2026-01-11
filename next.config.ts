import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable development indicators and overlay
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: "bottom-right",
  },
};

export default nextConfig;

