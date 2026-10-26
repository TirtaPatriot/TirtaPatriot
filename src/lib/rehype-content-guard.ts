/**
 * Plugin rehype untuk konten dinamis dari CMS (markdown maupun HTML dari editor WYSIWYG).
 *
 * Dijalankan setelah `rehype-raw` sehingga HTML mentah sudah menjadi elemen. Tugasnya:
 *  1. Keamanan: hanya tag dan atribut yang diizinkan yang lolos, URL divalidasi,
 *     dan iframe hanya boleh berasal dari host tepercaya.
 *  2. Layout: tabel dan embed dibungkus agar muat di layar kecil, paragraf kosong
 *     (sisa editor) dibuang, dan perataan teks inline diubah menjadi kelas.
 *
 * Tag yang tidak dikenal (termasuk komponen MDC/Vue) tidak dirender sebagai komponen,
 * isinya dipertahankan agar teks tidak hilang.
 */

type HastNode = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, any>
  children?: HastNode[]
}

/** Tag yang dibuang beserta isinya. */
const DROP_WITH_CONTENT = new Set([
  'script', 'style', 'link', 'meta', 'base', 'object', 'embed', 'applet', 'form', 'input',
  'button', 'textarea', 'select', 'option', 'svg', 'math', 'template', 'noscript', 'frame',
  'frameset', 'canvas', 'dialog', 'title', 'head',
])

const ALLOWED_TAGS = new Set([
  'a', 'abbr', 'address', 'article', 'aside', 'b', 'blockquote', 'br', 'caption', 'cite', 'code',
  'col', 'colgroup', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'iframe', 'img', 'ins', 'kbd', 'li', 'mark', 'ol',
  'p', 'pre', 'q', 's', 'section', 'small', 'source', 'span', 'strong', 'sub', 'summary', 'sup',
  'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time', 'tr', 'u', 'ul', 'video',
])

/** Atribut yang diizinkan per tag (nama properti hast, camelCase). `*` berlaku untuk semua tag. */
const ALLOWED_ATTRS: Record<string, string[]> = {
  '*': ['id', 'title'],
  'a': ['href'],
  'img': ['src', 'alt'],
  'iframe': ['src', 'allowFullScreen'],
  'video': ['src', 'poster', 'controls', 'muted', 'loop', 'playsInline', 'preload'],
  'source': ['src', 'type'],
  'td': ['colSpan', 'rowSpan'],
  'th': ['colSpan', 'rowSpan', 'scope'],
  'col': ['span'],
  'colgroup': ['span'],
  'ol': ['start', 'reversed'],
  'li': ['value'],
  'details': ['open'],
  'time': ['dateTime'],
  'blockquote': ['cite'],
  'q': ['cite'],
}

const URL_ATTRS = new Set(['href', 'src', 'poster', 'cite'])
const LINK_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:'])
const MEDIA_SCHEMES = new Set(['http:', 'https:'])

const EMBED_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'www.google.com',
  'maps.google.com',
])

const ID_PATTERN = /^[A-Z][\w:.-]{0,100}$/i
const ALIGN_PATTERN = /text-align\s*:\s*(left|right|center|justify)/i

export function isSafeUrl (value: unknown, schemes: Set<string>): value is string {
  if (typeof value !== 'string') {
    return false
  }

  // buang spasi dan karakter kontrol yang dipakai untuk menyamarkan skema (mis. "java\nscript:")
  const compact = value.replaceAll(/[\p{Cc}\s]+/gu, '')
  if (!compact) {
    return false
  }

  const scheme = /^([a-z][a-z0-9+.-]*:)/i.exec(compact)?.[1]?.toLowerCase()
  if (scheme) {
    return schemes.has(scheme)
  }

  // tanpa skema: path relatif, anchor, query, atau protocol-relative
  return true
}

function isEmbedAllowed (src: unknown): src is string {
  if (typeof src !== 'string') {
    return false
  }

  try {
    const url = new URL(src.startsWith('//') ? `https:${src}` : src)
    if (url.protocol !== 'https:' || !EMBED_HOSTS.has(url.hostname)) {
      return false
    }

    // google.com hanya untuk peta tertanam
    return !url.hostname.endsWith('google.com') || url.pathname.startsWith('/maps/embed')
  } catch {
    return false
  }
}

function textOf (node: HastNode): string {
  if (node.type === 'text') {
    return node.value ?? ''
  }

  return (node.children ?? []).map(child => textOf(child)).join('')
}

const MEDIA_TAGS = new Set(['img', 'iframe', 'video', 'hr', 'table'])

function hasMedia (node: HastNode): boolean {
  if (node.type === 'element' && MEDIA_TAGS.has(node.tagName ?? '')) {
    return true
  }

  return (node.children ?? []).some(child => hasMedia(child))
}

function isEmptyParagraph (node: HastNode): boolean {
  const text = textOf(node).replace(/\s+/g, '')
  return !text && !hasMedia(node)
}

function cleanProperties (tag: string, properties: Record<string, any> = {}) {
  const allowed = new Set([...ALLOWED_ATTRS['*']!, ...(ALLOWED_ATTRS[tag] ?? [])])
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(properties)) {
    if (!allowed.has(key) || value === undefined || value === null || value === false) {
      continue
    }

    if (URL_ATTRS.has(key)) {
      const schemes = key === 'href' || key === 'cite' ? LINK_SCHEMES : MEDIA_SCHEMES
      if (isSafeUrl(value, schemes)) {
        result[key] = String(value).trim()
      }
      continue
    }

    if (key === 'id') {
      if (ID_PATTERN.test(String(value))) {
        result[key] = String(value)
      }
      continue
    }

    result[key] = value
  }

  // perataan dari editor ("style=text-align:center") diganti kelas, style lain dibuang
  const align = typeof properties.style === 'string' ? ALIGN_PATTERN.exec(properties.style)?.[1]?.toLowerCase() : undefined
  if (align) {
    result.className = [`content-align-${align}`]
  }

  return result
}

function element (tagName: string, properties: Record<string, any>, children: HastNode[]): HastNode {
  return { type: 'element', tagName, properties, children }
}

function sanitizeNode (node: HastNode): HastNode[] {
  if (node.type === 'text') {
    return [node]
  }

  // comment, raw, doctype, dan tipe lain tidak diteruskan
  if (node.type !== 'element') {
    return []
  }

  const tag = (node.tagName ?? '').toLowerCase()

  if (DROP_WITH_CONTENT.has(tag)) {
    return []
  }

  const children = (node.children ?? []).flatMap(child => sanitizeNode(child))

  // pembungkus buatan PContent: cukup dibuka agar isinya langsung tampil
  if (tag === 'div' && node.properties && 'dataContentWrapper' in node.properties) {
    return children
  }

  if (!ALLOWED_TAGS.has(tag)) {
    return children
  }

  const properties = cleanProperties(tag, node.properties)

  switch (tag) {
    case 'a': {
      // tautan tanpa href tujuan yang aman tidak ada gunanya, pertahankan teksnya saja
      return properties.href ? [element('a', properties, children)] : children
    }
    case 'img': {
      return properties.src ? [element('img', properties, [])] : []
    }
    case 'source': {
      return properties.src ? [element('source', properties, [])] : []
    }
    case 'iframe': {
      if (!isEmbedAllowed(properties.src)) {
        return []
      }

      const frame = element('iframe', {
        ...properties,
        src: properties.src.startsWith('//') ? `https:${properties.src}` : properties.src,
        title: properties.title || 'Konten tertanam',
        loading: 'lazy',
        referrerPolicy: 'strict-origin-when-cross-origin',
        sandbox: 'allow-scripts allow-same-origin allow-presentation allow-popups',
        allowFullScreen: true,
      }, [])

      return [element('div', { className: ['content-embed'] }, [frame])]
    }
    case 'video': {
      return properties.src || children.some(c => c.tagName === 'source')
        ? [element('video', { controls: true, preload: 'metadata', ...properties }, children)]
        : []
    }
    case 'table': {
      return [element('div', { className: ['content-table'] }, [element('table', properties, children)])]
    }
    case 'p': {
      const paragraph = element('p', properties, children)
      return isEmptyParagraph(paragraph) ? [] : [paragraph]
    }
    case 'br': {
      return [element('br', {}, [])]
    }
    default: {
      return [element(tag, properties, children)]
    }
  }
}

export default function rehypeContentGuard () {
  return (tree: HastNode) => {
    tree.children = (tree.children ?? []).flatMap(child => sanitizeNode(child))
  }
}
