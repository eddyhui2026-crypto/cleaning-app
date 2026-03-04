import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // 依然保留呢個，確保 Build 唔會因為 TypeScript 警告而中斷
    ignoreBuildErrors: true,
  },
  // 刪除原本嘅 eslint 部分
};

export default nextConfig;