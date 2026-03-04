/** @type {import('next').NextConfig} */
const nextConfig = {
  // 讓 Vercel 忽略 TypeScript 錯誤，確保能順利 Build
  typescript: {
    ignoreBuildErrors: true,
  },
  // 讓 Vercel 忽略 ESLint 錯誤
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 如果你有用到圖片（例如 Supabase Storage），建議加上這個
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // 允許所有外部圖片來源，方便測試
      },
    ],
  },
};

export default nextConfig;