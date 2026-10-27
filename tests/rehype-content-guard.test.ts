/* eslint-disable unicorn/prefer-https -- skema http sengaja diuji (diterima untuk tautan, ditolak untuk iframe) */
import { describe, expect, it } from 'bun:test'
import { fromParse5 } from 'hast-util-from-parse5'
import { toHtml } from 'hast-util-to-html'
import { parseFragment } from 'parse5'
import rehypeContentGuard, { isSafeUrl } from '../src/lib/rehype-content-guard'

/** Jalankan plugin pada fragmen HTML dan kembalikan HTML hasilnya. */
function guard (html: string) {
  const tree: any = fromParse5(parseFragment(html) as any)
  rehypeContentGuard()(tree)
  return toHtml(tree)
}

describe('isSafeUrl', () => {
  const links = new Set(['http:', 'https:', 'mailto:', 'tel:'])

  it('menerima http(s), mailto, tel, dan URL relatif', () => {
    for (const url of ['https://example.com/a', 'http://example.com', 'mailto:a@b.id', 'tel:+6221', '/pelanggan/tagihan', '#bagian', '?q=1', 'halaman/lain']) {
      expect(isSafeUrl(url, links)).toBe(true)
    }
  })

  it('menolak skema berbahaya, termasuk yang disamarkan', () => {
    for (const url of ['javascript:alert(1)', '  jAvAsCrIpT:alert(1)', 'java\tscript:alert(1)', 'java\nscript:alert(1)', 'data:text/html;base64,AAAA', 'vbscript:x', 'file:///etc/passwd', '']) {
      expect(isSafeUrl(url, links)).toBe(false)
    }
  })
})

describe('rehypeContentGuard: keamanan', () => {
  it('membuang script beserta isinya', () => {
    expect(guard('<p>a</p><script>alert(1)</script><p>b</p>')).toBe('<p>a</p><p>b</p>')
  })

  it('membuang handler on* dan atribut style', () => {
    const out = guard('<p onclick="x()" style="color:red">teks</p><img src="/a.png" onerror="x()">')
    expect(out).not.toMatch(/onclick|onerror|style=/i)
    expect(out).toContain('<p>teks</p>')
    expect(out).toContain('<img src="/a.png">')
  })

  it('membuang tautan dengan href berbahaya tetapi mempertahankan teksnya', () => {
    const out = guard('<a href="javascript:alert(1)">klik</a> <a href="  jAvAsCrIpT:alert(1)">lagi</a>')
    expect(out).not.toContain('<a')
    expect(out).toContain('klik')
    expect(out).toContain('lagi')
  })

  it('mempertahankan tautan aman', () => {
    expect(guard('<a href="https://example.com/x" title="t">ok</a>')).toBe('<a href="https://example.com/x" title="t">ok</a>')
    expect(guard('<a href="/pelanggan/tagihan">ok</a>')).toBe('<a href="/pelanggan/tagihan">ok</a>')
  })

  it('membuang gambar dengan sumber berbahaya', () => {
    expect(guard('<img src="javascript:alert(1)"><img src="data:image/svg+xml;base64,AAAA">')).toBe('')
  })

  it('tidak membiarkan tag tak dikenal/komponen Vue dirender, isinya tetap ada', () => {
    const out = guard('<v-btn>Tombol</v-btn><my-component>isi</my-component>')
    expect(out).toBe('Tombolisi')
  })

  it('membuang form, svg, style, dan elemen berbahaya lain', () => {
    expect(guard('<form action="/x"><input name="a"></form><svg onload="x()"></svg><style>p{}</style><object data="x"></object><embed src="x">')).toBe('')
  })

  it('hanya mengizinkan id yang aman', () => {
    expect(guard('<h2 id="bagian-1">a</h2>')).toBe('<h2 id="bagian-1">a</h2>')
    expect(guard('<h2 id="a b&quot;c">a</h2>')).toBe('<h2>a</h2>')
  })
})

describe('rehypeContentGuard: iframe', () => {
  it('mengizinkan YouTube, membungkus, dan memberi sandbox', () => {
    const out = guard('<iframe src="https://www.youtube.com/embed/abc" srcdoc="<script>x</script>" onload="x()"></iframe>')
    expect(out).toContain('class="content-embed"')
    expect(out).toContain('src="https://www.youtube.com/embed/abc"')
    expect(out).toContain('sandbox=')
    expect(out).toContain('loading="lazy"')
    expect(out).not.toMatch(/srcdoc|onload/i)
  })

  it('mengizinkan peta Google tertanam saja', () => {
    expect(guard('<iframe src="https://www.google.com/maps/embed?pb=1"></iframe>')).toContain('content-embed')
    expect(guard('<iframe src="https://www.google.com/search?q=x"></iframe>')).toBe('')
  })

  it('menolak host lain, http biasa, dan javascript', () => {
    for (const src of ['https://evil.example/x', 'http://www.youtube.com/embed/abc', 'javascript:alert(1)', 'https://www.youtube.com.evil.example/x']) {
      expect(guard(`<iframe src="${src}"></iframe>`)).toBe('')
    }
  })
})

describe('rehypeContentGuard: layout', () => {
  it('membungkus tabel agar bisa digeser horizontal', () => {
    const out = guard('<table style="width:2000px"><tr><td colspan="2">x</td></tr></table>')
    expect(out).toContain('<div class="content-table"><table>')
    expect(out).toContain('colspan="2"')
    expect(out).not.toContain('2000px')
  })

  it('membuang paragraf kosong sisa editor', () => {
    expect(guard('<p>&nbsp;</p><p><br></p><p>  </p><p>isi</p>')).toBe('<p>isi</p>')
  })

  it('tidak membuang paragraf yang hanya berisi gambar', () => {
    expect(guard('<p><img src="/a.png" alt="a"></p>')).toBe('<p><img src="/a.png" alt="a"></p>')
  })

  it('mengubah perataan inline menjadi kelas', () => {
    expect(guard('<p style="color:red;text-align:center">x</p>')).toBe('<p class="content-align-center">x</p>')
  })

  it('membuang kelas dari penulis konten', () => {
    expect(guard('<p class="v-btn bg-error">x</p>')).toBe('<p>x</p>')
  })

  it('membuka pembungkus buatan PContent', () => {
    expect(guard('<div data-content-wrapper><p>x</p></div>')).toBe('<p>x</p>')
  })
})
