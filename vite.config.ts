import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({disable: true,disable: true,
        registerType: 'autoUpdate',
        manifest: {
          name: 'Nahj al-Nur | نهج النور',
          short_name: 'Nahj al-Nur',
          description: 'An integrated Islamic Shia application featuring prayer times, supplications and more.',
          theme_color: '#18181b',
          background_color: '#18181b',
          display: 'standalone',
          icons: [
            {
              src: 'icons/icon-192.jpg',
              sizes: '192x192',
              type: 'image/jpeg'
            },
            {
              src: 'icons/icon-512.jpg',
              sizes: '512x512',
              type: 'image/jpeg'
            },
            {
              src: 'icons/icon-512.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
