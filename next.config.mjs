/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // El service worker nunca debe quedarse cacheado por el navegador.
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
