import { defineOrganization } from 'nuxt-schema-org/schema'

type DirectusArticleRecord = {
  permalink?: string | null
}

async function loadArticleRoutesFromDirectus (): Promise<string[]> {
  const directusUrl = process.env.NUXT_PUBLIC_DIRECTUS_URL

  if (!directusUrl) {
    return []
  }

  try {
    const response = await $fetch<{ data?: DirectusArticleRecord[] }>(`${directusUrl}/items/artikel`, {
      query: {
        'fields': 'permalink',
        'limit': -1,
        'sort': '-date_created',
        'filter[status][_eq]': 'published',
      },
    })

    return (response.data ?? [])
      .map(item => item.permalink?.trim())
      .filter((route): route is string => !!route && route.startsWith('/'))
  } catch {
    return []
  }
}

const articleRoutes = await loadArticleRoutesFromDirectus()

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-12-21',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  sourcemap: {
    client: false,
    server: false,
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'id',
      },
    },
  },

  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },

  // ssr: false,
  modules: ['@nuxt/fonts', '@unocss/nuxt', 'vuetify-nuxt-module', '@nuxt/eslint', '@nuxt/image', 'nuxt-directus', '@productdevbook/chatwoot', '@nuxtjs/seo', '@nuxtjs/mdc'],

  css: [
    'assets/styles/layers.css',
    'vuetify/styles',
    'assets/styles/main.scss',
  ],

  runtimeConfig: {
    public: {
      mdc: {
        useNuxtImage: true,
      },
      chatwoot: {
        init: {
          websiteToken: process.env.NUXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN,
          baseUrl: process.env.NUXT_PUBLIC_CHATWOOT_BASE_URL,
        },
        settings: {
          locale: 'id',
          theme: 'light',
          launcherTitle: 'Hubungi Kami',
        },
      },
      apiUrl: process.env.NUXT_PUBLIC_API_URL ?? '/api',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY,
      directusUrl: process.env.NUXT_PUBLIC_DIRECTUS_URL,
    },
  },

  site: {
    name: process.env.NUXT_SITE_NAME ?? process.env.NUXT_ENV_SITE_NAME ?? 'Perumda Tirta Patriot',
    url: process.env.NUXT_SITE_URL ?? process.env.NUXT_PUBLIC_SITE_URL ?? process.env.NUXT_ENV_SITE_URL ?? 'https://tirtapatriot.co.id',
    defaultLocale: 'id',
    language: 'id-ID',
  },

  seo: {
    redirectToCanonicalSiteUrl: false,
  },
  sitemap: {
    enabled: true,
    zeroRuntime: true,
    urls: articleRoutes,
  },

  nitro: {
    prerender: {
      // Throttle static crawling to avoid Directus API rate limiting on generate.
      concurrency: 1,
      interval: 250,
      retry: 3,
      retryDelay: 500,
      routes: articleRoutes,
    },
  },

  ogImage: {
    enabled: true,
    zeroRuntime: true,
    renderer: 'satori',
  },
  robots: {
    enabled: true,
  },
  seoExperiments: {
    enabled: process.env.NODE_ENV === 'production',
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
        'https://t.me/TirtaPatriot',
        'https://t.me/PerumdaTirtaPatriot',
        'https://whatsapp.com/channel/0029VaaWmpGId7nRB1BLj52w',
        'https://wa.me/6287875163845',
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
    enabled: process.env.NODE_ENV === 'production',
  },
  vuetify: {
    moduleOptions: {
      styles: { configFile: 'assets/styles/settings.scss' },
      ssrClientHints: {
        reloadOnFirstRequest: false,
        viewportSize: true,
        prefersColorScheme: false,
        prefersReducedMotion: true,
        prefersColorSchemeOptions: {
          useBrowserThemeOnly: true,
        },
      },
    },
    vuetifyOptions: './vuetify.config.ts',
  },

  eslint: {
    config: {
      import: {
        package: 'eslint-plugin-import-lite',
      },
    },
  },
  directus: {
    url: process.env.NUXT_PUBLIC_DIRECTUS_URL,
  },
  image: {
    provider: process.env.NUXT_IMAGE_PROVIDER,
    directus: {
      baseURL: process.env.NUXT_IMAGE_PROVIDER_BASE_URL!,
    },
  },
})
