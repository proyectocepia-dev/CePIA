import type { NextConfig } from 'next';

// Sitio estático por defecto: todas las rutas se generan en el build (generateStaticParams).
const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
};

export default nextConfig;
