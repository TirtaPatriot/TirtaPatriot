/** Data tetap perusahaan yang dipakai di banyak halaman. */

export const SITE_NAME = 'Perumda Tirta Patriot'
export const SITE_LEGAL_NAME = 'Perusahaan Umum Daerah Air Minum Tirta Patriot Kota Bekasi'
export const SITE_DESCRIPTION = 'Perusahaan Umum Daerah Air Minum Tirta Patriot merupakan Badan Usaha Milik Daerah Pemerintah Kota Bekasi yang bergerak di bidang pelayanan air bersih.'

export const ADDRESS = 'Jl. Perjuangan No.99, RT.003/RW.011, Marga Mulya, Kec. Bekasi Utara, Kota Bekasi, Jawa Barat 17142'

export const WHATSAPP_CC = 'https://wa.me/6287875163845'

export const CONTACTS = [
  { title: 'Telepon', value: '021-8896-6161', icon: 'mdi:phone-outline', href: 'tel:+622188966161' },
  { title: 'WhatsApp Humas', value: '0878-7516-3845', icon: 'mdi:whatsapp', href: WHATSAPP_CC },
  { title: 'Email Humas', value: 'humas@tirtapatriot.co.id', icon: 'mdi:email-outline', href: 'mailto:humas@tirtapatriot.co.id' },
  { title: 'Email Sekretariat', value: 'sekretariat@tirtapatriot.co.id', icon: 'mdi:email-outline', href: 'mailto:sekretariat@tirtapatriot.co.id' },
]

export const SOCIALS = [
  { title: 'WhatsApp', icon: 'mdi:whatsapp', href: WHATSAPP_CC },
  { title: 'Telegram', icon: 'mdi:telegram', href: 'https://t.me/TirtaPatriot' },
  { title: 'Instagram', icon: 'mdi:instagram', href: 'https://instagram.com/TirtaPatriot' },
  { title: 'Facebook', icon: 'mdi:facebook', href: 'https://www.facebook.com/PerumdaTirtaPatriot' },
  { title: 'X', icon: 'mdi:twitter', href: 'https://x.com/TirtaPatriot' },
]

// sesuai jam operasional kantor di sistem Informasi Pelanggan (info_pelanggan.cabang)
export const HOURS = 'Senin sampai Jumat, 08.00–16.00 WIB'

export const APP_LINKS = {
  play: 'https://play.google.com/store/apps/details?id=com.tpkb.intipasi',
  appStore: 'https://apps.apple.com/id/app/tirta-patriot-mobile/id6783699713',
}

export const ORGANIZATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': SITE_NAME,
  'alternateName': 'Tirta Patriot',
  'legalName': 'Perusahaan Umum Daerah Air Minum Tirta Patriot Kota Bekasi',
  'description': SITE_DESCRIPTION,
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': 'Jl. Perjuangan No.99, RT.003/RW.011, Marga Mulya, Kec. Bekasi Utara',
    'addressLocality': 'Kota Bekasi',
    'addressRegion': 'Jawa Barat',
    'postalCode': '17142',
    'addressCountry': 'ID',
  },
  'email': 'sekretariat@tirtapatriot.co.id',
  'telephone': '+6221-8896-6161',
  'contactPoint': {
    '@type': 'ContactPoint',
    'telephone': '+62 878-7516-3845',
    'email': 'humas@tirtapatriot.co.id',
  },
  'foundingDate': '2010-01-15',
  'numberOfEmployees': {
    '@type': 'QuantitativeValue',
    'minValue': 500,
    'maxValue': 999,
  },
  'sameAs': [
    'https://x.com/TirtaPatriot',
    'https://www.facebook.com/PerumdaTirtaPatriot',
    'https://instagram.com/TirtaPatriot',
    'https://tiktok.com/PerumdaTirtaPatriot',
    'https://youtube.com/@TirtaPatriot',
    'https://t.me/TirtaPatriot',
    'https://t.me/PerumdaTirtaPatriot',
    'https://whatsapp.com/channel/0029VaaWmpGId7nRB1BLj52w',
    'https://wa.me/6287875163845',
  ],
  'taxID': '31.448.123.6-407.000',
  'duns': '56-457-1833',
  'iso6523Code': '0060:123456789',
}
