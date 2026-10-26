interface ImportMetaEnv {
  /** alamat CMS Directus, bawaan https://cms.tirtapatriot.net */
  readonly PUBLIC_DIRECTUS_URL?: string
  /** alamat API layanan pelanggan, bawaan /api */
  readonly PUBLIC_API_URL?: string
  readonly PUBLIC_RECAPTCHA_SITE_KEY?: string
  readonly PUBLIC_CHATWOOT_WEBSITE_TOKEN?: string
  readonly PUBLIC_CHATWOOT_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
