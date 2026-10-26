/** Perbesar gambar di dalam konten CMS (tombol `[data-zoom]` dibuat oleh render-content). */
const dialog = document.querySelector<HTMLDialogElement>('#zoom')
const image = dialog?.querySelector('img')

document.addEventListener('click', event => {
  const trigger = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-zoom]')
  const source = trigger?.querySelector('img')
  if (!dialog || !image || !source) {
    return
  }

  image.src = source.currentSrc || source.src
  image.alt = source.alt
  dialog.showModal()
})

// klik di luar gambar menutup penampil
dialog?.addEventListener('click', event => {
  if (event.target === dialog) {
    dialog.close()
  }
})
