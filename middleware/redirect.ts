export default defineNuxtRouteMiddleware((to) => {
  const legacy = Object.entries({
    '/info-tagihan': '/pelanggan/tagihan',
    '/pendaftaran-pasang-baru': '/pelanggan/pendaftaran',
    '/profile': '/perusahaan/manajemen',
    '/tempat-pembayaran': '/informasi/tempat-pembayaran',
    '/info/berita': '/informasi/berita',
    '/pengumuman-pelanggan': '/informasi/berita',
  })

  const found = legacy.find(l => to.path.startsWith(l[0]))
  if (found)
    return navigateTo(found[1], { redirectCode: 301 })
})
