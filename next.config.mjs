/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: () => ([
    {
      source: "/:path*",
      headers: [
        {
          key: "Cross-Origin-Opener-Policy",
          value: "same-origin"
        },
        {
          key: "Cross-Origin-Embedder-Policy",
          value: "require-corp"
        },
        {
          key: "cross-origin-resource-policy",
          value: "same-origin"
        }
      ]
    }
  ])
};

export default nextConfig;
