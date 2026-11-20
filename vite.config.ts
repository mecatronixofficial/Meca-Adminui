import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Link-preview scrapers need absolute image URLs. `%SITE_URL%` in index.html becomes
 * VITE_ADMIN_URL (e.g. https://admin.mecatronix.one), or stays relative when unset.
 */
function siteUrl(url: string): Plugin {
  const base = url.trim().replace(/\/+$/, '')
  return {
    name: 'mecatronix:site-url',
    transformIndexHtml: (html) =>
      html
        .replaceAll('%SITE_URL%', base)
        .replace('</title>', base ? `</title>\n    <link rel="canonical" href="${base}/" />\n    <meta property="og:url" content="${base}/" />` : '</title>'),
  }
}

/** Long-lived vendor chunks: app deploys don't invalidate React or the chart library in browser caches. */
function vendorChunk(id: string) {
  if (!id.includes('node_modules')) return undefined
  if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|cookie|set-cookie-parser)[\\/]/.test(id)) return 'react'
  if (/[\\/]node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|internmap)[\\/]/.test(id)) return 'charts'
  if (/[\\/]node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion'
  if (/[\\/]node_modules[\\/](zod|react-hook-form|@hookform)[\\/]/.test(id)) return 'forms'
  return undefined
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react(), tailwindcss(), siteUrl(env.VITE_ADMIN_URL ?? '')],
    // Fixed port so it matches ADMIN_URL in the server's CORS allow-list (client UI uses 5173).
    server: {
      port: 5174,
      strictPort: true,
      proxy: {
        '/mec-api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 4174,
      proxy: {
        '/mec-api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: { manualChunks: vendorChunk },
      },
    },
  }
})
