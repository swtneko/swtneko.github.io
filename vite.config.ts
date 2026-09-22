import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const geminiKeys = env.GEMINI_API_KEYS || env.GEMINI_API_KEY || process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  const deepseekKey = env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || env.VITE_DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || '';
  const groqKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '';
  const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '';
  const openrouterKey = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || '';

  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
        manifest: {
          id: '/',
          name: 'Neko Tarot & Tử Vi',
          short_name: 'NekoTarot',
          description: 'Ứng dụng Neko Tarot, Bài Tây & Tử Vi Đẩu Số kết hợp AI luận giải chuyên sâu.',
          theme_color: '#0b0818',
          background_color: '#07040d',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKeys),
      'process.env.GEMINI_API_KEYS': JSON.stringify(geminiKeys),
      'process.env.DEEPSEEK_API_KEY': JSON.stringify(deepseekKey),
      'process.env.GROQ_API_KEY': JSON.stringify(groqKey),
      'process.env.OPENAI_API_KEY': JSON.stringify(openaiKey),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(openrouterKey),
      'process.env.VITE_APP_URL': JSON.stringify(env.VITE_APP_URL || process.env.VITE_APP_URL || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    preview: {
      host: '0.0.0.0',
      port: 3000,
    },
  };
});
