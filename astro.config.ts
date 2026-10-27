import { unified } from '@astrojs/markdown-remark'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'
import rehypeContentGuard from './src/lib/rehype-content-guard'
import { rehypeContentEnhance } from './src/lib/render-content'

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://tirtapatriot.co.id',
  output: 'static',
  trailingSlash: 'ignore',

  build: {
    // /berita/judul-artikel/index.html sehingga URL lama tanpa garis miring tetap terlayani
    format: 'directory',
  },

  markdown: {
    // Markdown di repo (berita, halaman, dokumen legal) melewati penyaring yang sama dengan konten
    // dinamis: HTML mentah dibuang, tabel dibungkus, gambar dapat diperbesar, tautan luar di tab baru
    processor: unified({
      rehypePlugins: [rehypeContentGuard as never, rehypeContentEnhance],
    }),
  },

  integrations: [
    sitemap({
      filter: page => !page.includes('/404'),
    }),
  ],

  fonts: [
    {
      // Plus Jakarta Sans: huruf yang dirancang untuk identitas kota Jakarta
      provider: fontProviders.fontsource(),
      name: 'Plus Jakarta Sans',
      cssVariable: '--font-jakarta',
      weights: ['400 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },
})
