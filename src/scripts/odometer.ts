/** Putar register odometer sekali, saat pertama kali masuk layar. */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const meters = [...document.querySelectorAll<HTMLElement>('[data-odometer]')]

if (!reduce && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-on')
        observer.unobserve(entry.target)
      }
    }
  }, { threshold: 0.6 })

  for (const meter of meters) {
    meter.classList.add('is-armed')
    // satu frame agar posisi nol tergambar sebelum transisi dimulai
    requestAnimationFrame(() => observer.observe(meter))
  }
}
