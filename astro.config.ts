import { unified } from '@astrojs/markdown-remark'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, fontProviders } from 'astro/config'
import rehypeContentGuard from './src/lib/rehype-content-guard'
import { rehypeContentEnhance } from './src/lib/render-content'

/** Tanggal terakhir berubah tiap artikel terbit (diperbarui, atau terbit) dari front matter Markdown, untuk lastmod sitemap. */
function artikelLastmod (): { perUrl: Map<string, string>, perJenis: Map<string, string> } {
  const perUrl = new Map<string, string>()
  const perJenis = new Map<string, string>()
  for (const jenis of ['berita', 'edukasi']) {
    const dir = join(import.meta.dirname, 'src/content/artikel', jenis)
    for (const file of existsSync(dir) ? readdirSync(dir).filter(name => name.endsWith('.md')) : []) {
      const front = readFileSync(join(dir, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
      const field = (key: string) => front.match(new RegExp(`^${key}:\\s*["']?([^"'\\r\\n]+?)["']?\\s*$`, 'm'))?.[1]
      if (/^draf:\s*true/m.test(front)) {
        continue
      }
      const date = new Date(field('diperbarui') ?? field('terbit') ?? '')
      if (Number.isNaN(date.getTime())) {
        continue
      }
      const iso = date.toISOString()
      perUrl.set(`/${jenis}/${file.replace(/\.md$/, '')}`, iso)
      if (iso > (perJenis.get(jenis) ?? '')) {
        perJenis.set(jenis, iso)
      }
    }
  }
  return { perUrl, perJenis }
}

const lastmod = artikelLastmod()

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // domain publik untuk URL absolut (canonical, Open Graph, sitemap, robots.txt); bisa diganti lewat build-arg SITE_URL
  site: process.env.SITE_URL || 'https://web.tirtapatriot.id',
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
      // halaman hasil pencarian dan 404 bertanda noindex, jadi tidak masuk sitemap
      filter: page => !/\/(404|cari)\/?$/.test(page),
      // lastmod hanya bila tanggalnya nyata: artikel, dan indeks berita/edukasi mengikuti artikel terbarunya
      serialize (item) {
        const path = new URL(item.url).pathname.replace(/\/$/, '')
        const date = lastmod.perUrl.get(path) ?? lastmod.perJenis.get(path.slice(1))
        return date ? { ...item, lastmod: date } : item
      },
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
