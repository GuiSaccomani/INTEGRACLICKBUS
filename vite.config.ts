import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/index.html',
      },
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-512x512.png'
      ],
      manifest: {
        name: 'ÍNTEGRA - Plataforma de Embarque Digital',
        short_name: 'ÍNTEGRA',
        description: 'Plataforma de Embarque Digital com NFC, QR Code e validação em tempo real.',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#110826',
        background_color: '#0D0118',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf}'],
        navigateFallback: '/index.html',
        // Nunca redirecionar requisições de API para o fallback do index.html
        navigateFallbackDenylist: [
          /^\/passenger/,
          /^\/driver/,
          /^\/luggages/,
          /^\/login/,
          /^\/auth/,
          /^\/health/,
          /^\/api/
        ],
        runtimeCaching: [
          // Google Fonts Stylesheets
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Google Fonts Webfonts
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // REGRA DE SEGURANÇA MÁXIMA: NUNCA cachear dados dinâmicos da API
          // Todos os endpoints operacionais, de passageiros, tickets, motorista, bagagens e auth são NetworkOnly
          {
            urlPattern: ({ url }) => {
              const pathname = url.pathname;
              return (
                pathname.startsWith('/passenger') ||
                pathname.startsWith('/driver') ||
                pathname.startsWith('/luggages') ||
                pathname.startsWith('/login') ||
                pathname.startsWith('/auth') ||
                pathname.startsWith('/health') ||
                pathname.startsWith('/api')
              );
            },
            handler: 'NetworkOnly',
            options: {}
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
