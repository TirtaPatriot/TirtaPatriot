import process from 'node:process'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    rootId: 'TirtaPatriot',
    teleportId: 'Tele',
  },
  runtimeConfig: {
    recaptcha: {
      secretKey: process.env.NUXT_RECAPTCHA_SECRET_KEY,
    },
    public: {
      chatwoot: {
        init: {
          websiteToken: process.env.NUXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN,
          baseUrl: process.env.NUXT_PUBLIC_CHATWOOT_BASE_URL,
        },
      },
      apiUrl: process.env.NUXT_PUBLIC_API_URL ?? '/api',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY,
      directusUrl: process.env.NUXT_PUBLIC_DIRECTUS_URL,
    },
  },

  routeRules: {
    // '/': {
    //   swr: true,
    // },
    // '/sitemap.xml': {
    //   prerender: true,
    // },
    // '/informasi/**': { isr: true },
  },

  modules: [
    '@unocss/nuxt',
    '@nuxt/image',
    'vuetify-nuxt-module',
    '@vite-pwa/nuxt',
    '@nuxtjs/google-fonts',
    '@nuxtjs/seo',
    'nuxt-icon',
    'nuxt-directus',
  ],
  directus: {
    url: process.env.NUXT_PUBLIC_DIRECTUS_URL,
  },
  site: {
    url: 'https://tirtapatriot.co.id',
    name: 'Perumda Tirta Patriot',
    description: 'Menyediakan air lebih bersih, lebih sehat, lebih terjangkau.',
    defaultLocale: 'id',
  },
  seo: {
    splash: false,
    // redirectToCanonicalSiteUrl: true,
  },
  sitemap: {
    enabled: true,
  },
  ogImage: {
    enabled: true,
  },
  robots: {
    enabled: true,
  },
  seoExperiments: {
    enabled: true,
  },
  schemaOrg: {
    enabled: true,
  },
  linkChecker: {
    enabled: true,
  },
  googleFonts: {
    display: 'swap',
    download: false,
    families: {
      Roboto: {
        wght: [100, 300, 400, 500, 700, 900],
        ital: [100, 300, 400, 500, 700, 900],
      },
    },
  },
  image: {
    provider: process.env.NUXT_IMAGE_PROVIDER,
    directus: {
      baseURL: process.env.NUXT_IMAGE_PROVIDER_BASE_URL,
    },
  },
  vuetify: {
    moduleOptions: {
      ssrClientHints: {
        reloadOnFirstRequest: false,
        prefersColorScheme: true,
        prefersColorSchemeOptions: {
          useBrowserThemeOnly: false,
        },
        viewportSize: true,
      },
      // styles: {
      // configFile: 'assets/app.scss',
      // },
    },
  },
  pwa: {
    pwaAssets: {
      image: 'public/logo.png',
    },
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2,woff}'],
      runtimeCaching: [
        {
          handler: 'NetworkOnly',
          urlPattern: /\/api\/.*/,
          method: 'POST',
          options: {
            backgroundSync: {
              name: 'apiPost',
              options: {
                maxRetentionTime: 24 * 60,
              },
            },
          },
        },
        {
          urlPattern: /\/api\/.*/i,
          handler: 'CacheFirst',
          method: 'GET',
          options: {
            cacheName: 'apiGet',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24, // <== 1d
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    manifest: {
      name: 'TirtaPatriot',
      short_name: 'Perumda Tirta Patriot',
      description: 'Menyediakan air lebih bersih, lebih sehat, lebih terjangkau.',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
  },
})
