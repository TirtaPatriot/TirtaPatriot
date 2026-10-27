import { describe, expect, it } from 'bun:test'
import { parse, toNginx } from '../scripts/nginx-redirects'

describe('nginx-redirects', () => {
  it('menerjemahkan path tetap, splat, placeholder, dan domain', () => {
    const conf = toNginx(parse(`
# komentar
https://www.tirtapatriot.co.id/* https://tirtapatriot.co.id/:splat 301!
/info-tagihan\t/pelanggan/tagihan\t301
/info/berita/*\t/berita/:splat\t301
/pelanggan/pengaduan/:id\t/pelanggan/pengaduan?tiket=:id\t301!
`))
    expect(conf).toContain('if ($host ~* ^(www\\.tirtapatriot\\.co\\.id)$) {')
    expect(conf).toContain('location ~ ^/info-tagihan/?$ { return 301 /pelanggan/tagihan$is_args$args; }')
    expect(conf).toContain('location ~ ^/info/berita/(.*)$ { return 301 /berita/$1$is_args$args; }')
    expect(conf).toContain('location ~ ^/pelanggan/pengaduan/([^/]+)/?$ { return 301 /pelanggan/pengaduan?tiket=$1; }')
  })

  it('membaca seluruh public/_redirects tanpa aturan yang terlewat', async () => {
    const rules = parse(await Bun.file('public/_redirects').text())
    const conf = toNginx(rules)
    expect(conf.match(/^location /gm)?.length).toBe(rules.filter(rule => rule.from.startsWith('/')).length)
  })
})
