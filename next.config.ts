import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
  outputFileTracingIncludes: {
    '/api/statements/upload': ['./node_modules/pdfjs-dist/legacy/build/**'],
  },
};

export default nextConfig;
