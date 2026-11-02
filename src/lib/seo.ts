/** Data terstruktur (JSON-LD) dan pembantu SEO yang dipakai lintas halaman. */
import { SITE_DESCRIPTION, SITE_NAME } from './site'

export type LdCrumb = { name: string, url: string }

export function breadcrumbLd (items: LdCrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({ '@type': 'ListItem', 'position': index + 1, 'name': item.name, 'item': item.url })),
  }
}

export function websiteLd (site: URL | string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': SITE_NAME,
    'url': site.toString(),
    'description': SITE_DESCRIPTION,
    'inLanguage': 'id-ID',
  }
}

export function articleLd (article: { type: 'NewsArticle' | 'Article', title: string, description: string, url: string, image: string, published: Date, modified?: Date, site: URL | string }) {
  const publisher = {
    '@type': 'Organization',
    'name': SITE_NAME,
    'logo': { '@type': 'ImageObject', 'url': new URL('/logo.png', article.site).toString() },
  }
  return {
    '@context': 'https://schema.org',
    '@type': article.type,
    'headline': article.title,
    'description': article.description,
    'image': [article.image],
    'datePublished': article.published.toISOString(),
    'dateModified': (article.modified ?? article.published).toISOString(),
    'mainEntityOfPage': { '@type': 'WebPage', '@id': article.url },
    'inLanguage': 'id-ID',
    'author': publisher,
    publisher,
  }
}

/** Serialisasi aman untuk disisipkan di <script type="application/ld+json">. */
export function ldJson (data: object): string {
  return JSON.stringify(data).replaceAll('<', String.raw`<`)
}
