import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Otimizações para produção
  compress: true,
  poweredByHeader: false,
  // Configuração de imagens (se necessário no futuro)
  images: {
    domains: ['i.ibb.co'],
    formats: ['image/avif', 'image/webp'],
  },
  // Garantir encoding UTF-8
  output: 'standalone',
};

export default nextConfig;
