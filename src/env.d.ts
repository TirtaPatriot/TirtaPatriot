interface ImportMetaEnv {
  /** API layanan pelanggan (cek tagihan, pengaduan), bawaan https://open.tirtapatriot.net/web */
  readonly PUBLIC_API_URL?: string
  /** API Informasi Pelanggan (pengumuman gangguan), bawaan https://pelanggan.api.tirtapatriot.co */
  readonly PUBLIC_INFO_PELANGGAN_API?: string
  readonly PUBLIC_RECAPTCHA_SITE_KEY?: string
  readonly PUBLIC_CHATWOOT_WEBSITE_TOKEN?: string
  readonly PUBLIC_CHATWOOT_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
