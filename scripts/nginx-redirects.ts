/**
 * Terjemahkan public/_redirects (format Netlify) menjadi aturan nginx, agar image Docker
 * memakai pengalihan yang sama dengan hosting Netlify:
 *   bun scripts/nginx-redirects.ts public/_redirects > redirects.conf
 *
 * Didukung: path tetap, `*` → `:splat`, placeholder `:nama`, kode status, dan
 * pengalihan domain (`https://domain-lain/* https://tirtapatriot.co.id/:splat`).
 */
const CANONICAL = 'tirtapatriot.co.id'

type Rule = { from: string, to: string, status: number }

export function parse (source: string): Rule[] {
  return source.split('\n')
    .map(line => line.replace(/#.*$/, '').trim())
    .filter(Boolean)
    .map(line => {
      const [from = '', to = '', status = '301'] = line.split(/\s+/)
      return { from, to, status: Number.parseInt(status, 10) || 301 }
    })
}

const escape = (value: string) => value.replace(/[.+?^${}()|[\]\\]/g, '\\$&')

export function toNginx (rules: Rule[]): string {
  const hosts = rules.filter(rule => /^https?:\/\//.test(rule.from)).map(rule => new URL(rule.from.replace('/*', '/')).host)
  const lines: string[] = ['# dibangkitkan dari public/_redirects oleh scripts/nginx-redirects.ts; jangan diubah manual']

  if (hosts.length) {
    lines.push(`if ($host ~* ^(${hosts.map(escape).join('|')})$) {`, `  return 301 https://${CANONICAL}$request_uri;`, '}')
  }

  for (const rule of rules.filter(item => item.from.startsWith('/'))) {
    const names: string[] = []
    const pattern = rule.from
      .split('/')
      .map(part => {
        if (part === '*') {
          names.push('splat')
          return '(.*)'
        }
        if (part.startsWith(':')) {
          names.push(part.slice(1))
          return '([^/]+)'
        }
        return escape(part)
      })
      .join('/')
    let target = rule.to
    names.forEach((name, index) => {
      target = target.replaceAll(`:${name}`, `$${index + 1}`)
    })
    // pertahankan query string asal bila tujuan tidak punya query sendiri
    const args = target.includes('?') ? '' : '$is_args$args'
    const suffix = rule.from.endsWith('*') ? '' : '/?'
    lines.push(`location ~ ^${pattern}${suffix}$ { return ${rule.status} ${target}${args}; }`)
  }

  return `${lines.join('\n')}\n`
}

if (import.meta.main) {
  const file = process.argv[2] ?? 'public/_redirects'
  process.stdout.write(toNginx(parse(await Bun.file(file).text())))
}
