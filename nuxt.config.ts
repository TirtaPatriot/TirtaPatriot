import process from 'node:process'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-03',
  ssr: true,
  devtools: { enabled: true },
  app: {
    rootId: 'TirtaPatriot',
    teleportId: 'Tele',
  },
   // when enabling ssr option you need to disable inlineStyles and maybe devLogs
  features: {
    inlineStyles: false,
    devLogs: false,
  },
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
  },
  runtimeConfig: {
    recaptcha: {
      secretKey: process.env.NUXT_RECAPTCHA_SECRET_KEY,
    },
    public: {
      mdc: {
        useNuxtImage: true,
      },
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

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/sitemap.xml", "/robots.txt", "/"],
    },
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
    '@vueuse/nuxt',
    '@nuxtjs/mdc',
  ],
  mdc: {
    components: {
      prose: false,
    }
  },
  directus: {
    url: process.env.NUXT_PUBLIC_DIRECTUS_URL,
  },
  site: {
    url: 'https://tirtapatriot.co.id/',
    name: 'Perusahaan Umum Daerah Air Minum Tirta Patriot Kota Bekasi',
    description: 'Perumda (dulunya PDAM) Tirta Patriot merupakan Badan Usaha Milik Daerah Pemerintah Kota Bekasi yang bergerak di bidang pelayanan air bersih.',
    defaultLocale: 'id',
  },
  seo: {
    splash: false,
    redirectToCanonicalSiteUrl: false,
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
        prefersColorScheme: false,
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
          urlPattern: /(\/api)|https:\/\/cms.tirtapatriot.net\/.*/,
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
          urlPattern: /(\/api)|https:\/\/cms.tirtapatriot.net\/.*/i,
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
      periodicSyncForUpdates: 1800,
    },
    manifest: {
      name: 'Tirta Patriot',
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
