/**
 * Mengubah konten dinamis dari CMS (markdown atau HTML editor WYSIWYG) menjadi HTML aman.
 * Seluruhnya terjadi saat build; halaman hanya menerima HTML jadi.
 *
 * Urutan: parse → `rehype-content-guard` (keamanan & layout) → `rehypeContentEnhance`
 * (gambar dapat diperbesar, tautan eksternal dibuka di tab baru) → stringify.
 */
import type { Element, ElementContent, Root, RootContent } from 'hast'
import rehypeParse from 'rehype-parse'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import rehypeContentGuard from './rehype-content-guard'

const BLOCK_HTML = /^\s*<(?:p|div|h[1-6]|ul|ol|table|figure|blockquote|section|article|details)\b/i

const SITE_HOST = 'tirtapatriot.co.id'

export type ContentFormat = 'auto' | 'markdown' | 'html'

function isExternal (href: string): boolean {
  try {
    const url = new URL(href, `https://${SITE_HOST}/`)
    return /^https?:$/.test(url.protocol) && url.host !== SITE_HOST
  } catch {
    return false
  }
}

function srOnly (text: string): Element {
  return { type: 'element', tagName: 'span', properties: { className: ['sr-only'] }, children: [{ type: 'text', value: text }] }
}

function enhance (node: RootContent | ElementContent): ElementContent[] {
  if (node.type !== 'element') {
    return node.type === 'text' ? [node] : []
  }

  node.children = node.children.flatMap(child => enhance(child))

  if (node.tagName === 'a' && typeof node.properties.href === 'string' && isExternal(node.properties.href)) {
    node.properties.target = '_blank'
    node.properties.rel = ['noopener', 'noreferrer']
    node.children.push(srOnly(' (tautan eksternal, terbuka di tab baru)'))
    return [node]
  }

  if (node.tagName === 'img') {
    const alt = typeof node.properties.alt === 'string' ? node.properties.alt : ''
    const title = typeof node.properties.title === 'string' ? node.properties.title : ''
    node.properties = { ...node.properties, loading: 'lazy', decoding: 'async', alt }
    delete node.properties.title

    // tetap elemen inline (span/button): gambar markdown biasanya berada di dalam <p>
    const figure: Element = {
      type: 'element',
      tagName: 'span',
      properties: { className: ['content-figure'] },
      children: [
        {
          type: 'element',
          tagName: 'button',
          properties: { type: 'button', dataZoom: '', ariaLabel: alt ? `Perbesar gambar: ${alt}` : 'Perbesar gambar' },
          children: [node],
        },
      ],
    }

    if (title) {
      figure.children.push({ type: 'element', tagName: 'span', properties: { className: ['content-figcaption'] }, children: [{ type: 'text', value: title }] })
    }

    return [figure]
  }

  return [node]
}

function rehypeContentEnhance () {
  return (tree: Root) => {
    tree.children = tree.children.flatMap(child => enhance(child))
  }
}

export function isHtmlContent (value: string): boolean {
  return BLOCK_HTML.test(value)
}

async function markdownToHast (markdown: string): Promise<Root> {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype, { allowDangerousHtml: true }).use(rehypeRaw)
  return await processor.run(processor.parse(markdown)) as Root
}

export async function renderContent (value: string | null | undefined, format: ContentFormat = 'auto'): Promise<string> {
  const raw = String(value ?? '').trim()
  if (!raw) {
    return ''
  }

  const html = format === 'html' || (format === 'auto' && isHtmlContent(raw))

  const tree = html
    ? unified().use(rehypeParse, { fragment: true }).parse(raw)
    : await markdownToHast(raw)

  // tipe plugin guard sengaja longgar (bekerja langsung pada node hast mentah)
  const safe = await unified().use(rehypeContentGuard as never).use(rehypeContentEnhance).run(tree) as Root
  return unified().use(rehypeStringify).stringify(safe)
}

/** Teks polos untuk meta description bila CMS tidak menyediakan ringkasan. */
export function plainText (value: string | null | undefined, max = 160): string {
  const text = String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_`>[\]()!|-]+/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= max) {
    return text
  }

  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}
