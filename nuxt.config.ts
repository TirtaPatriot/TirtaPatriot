import process from 'node:process'
import { defineOrganization } from 'nuxt-schema-org/schema'

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
      routes: ['/sitemap.xml', '/robots.txt', '/'],
    },
  },

  modules: [
    '@unocss/nuxt',
    '@nuxt/image',
    'vuetify-nuxt-module',
    '@vite-pwa/nuxt',
    '@nuxtjs/google-fonts',
    '@nuxtjs/seo',
    '@nuxt/icon',
    'nuxt-directus',
    '@vueuse/nuxt',
    '@nuxtjs/mdc',
  ],
  mdc: {
    components: {
      prose: false,
    },
  },
  directus: {
    url: process.env.NUXT_PUBLIC_DIRECTUS_URL,
  },
  site: {
    url: 'https://tirtapatriot.co.id',
    name: 'Perusahaan Umum Daerah Air Minum Tirta Patriot Kota Bekasi',
    description: 'Perumda (dulunya PDAM) Tirta Patriot merupakan Badan Usaha Milik Daerah Pemerintah Kota Bekasi yang bergerak di bidang pelayanan air bersih.',
    defaultLocale: 'id',
    trailingSlash: true,
  },
  seo: {
    redirectToCanonicalSiteUrl: false,
  },
  sitemap: {
    enabled: true,
  },

  ogImage: {
    zeroRuntime: true,
    enabled: false,
  },
  robots: {
    enabled: true,
  },
  seoExperiments: {
    enabled: true,
  },
  schemaOrg: {
    enabled: true,
    identity: defineOrganization({
      // Basic Information
      name: 'Perumda Tirta Patriot',
      alternateName: 'Tirta Patriot',
      description: 'Perusahaan Umum Daerah Air Minum Tirta Patriot merupakan Badan Usaha Milik Daerah Pemerintah Kota Bekasi yang bergerak di bidang pelayanan air bersih.',
      url: 'https://tirtapatriot.co.id',
      logo: '/logo.png',

      // Address Information, if applicable
      address: {
        '@type': 'PostalAddress',
        'streetAddress': 'Jl. Perjuangan No.99, RT.003/RW.011, Marga Mulya, Kec. Bekasi Utara',
        'addressLocality': 'Kota Bekasi',
        'addressRegion': 'Jawa Barat',
        'postalCode': '17142',
        'addressCountry': 'ID',
      },

      // Contact Information, if applicable
      email: 'sekretariat@tirtapatriot.co.id',
      telephone: '+6221-8896-6161',
      contactPoint: {
        '@type': 'ContactPoint',
        'telephone': '+62 878-7516-3845',
        'email': 'humas@tirtapatriot.co.id',
      },

      // Business Details, if applicable
      foundingDate: '2010-01-15',
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        'minValue': 500,
        'maxValue': 999,
      },

      // Social and External Links, if applicable
      sameAs: [
        'https://x.com/TirtaPatriot',
        'https://www.facebook.com/PerumdaTirtaPatriot',
        'https://instagram.com/TirtaPatriot',
        'https://tiktok.com/PerumdaTirtaPatriot',
        'https://youtube.com/@TirtaPatriot',
      ],

      // Business Identifiers, if applicable
      legalName: 'Perusahaan Umum Daerah Air Minum Tirta Patriot Kota Bekasi',
      taxID: '31.448.123.6-407.000',
      // vatID: 'GB123456789',
      duns: '56-457-1833',
      iso6523Code: '0060:123456789',
      // naics: '541512',

      // Return Policy, if applicable
      // hasMerchantReturnPolicy: {
      //   '@type': 'MerchantReturnPolicy',
      //   'name': 'Standard Return Policy',
      //   'inStoreReturnsOffered': true,
      //   'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
      //   'returnPolicyCountry': 'US',
      //   'returnWindow': {
      //     '@type': 'BusinessDaysSpecification',
      //     'numberOfDays': 30,
      //   },
      // },
    }),
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
      name: 'Perumda Tirta Patriot',
      short_name: 'Tirta Patriot',
      description: 'Perusahaan Umum Daerah Air Minum Tirta Patriot merupakan Badan Usaha Milik Daerah Pemerintah Kota Bekasi yang bergerak di bidang pelayanan air bersih.',
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
