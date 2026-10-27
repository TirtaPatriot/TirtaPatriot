/**
 * Pemilih titik lokasi di peta (pendaftaran sambungan baru, lapor kebocoran).
 * Markup di dalam `root`: [data-picker] (wadah peta), [data-coords] (keterangan), [data-locate] (tombol lokasi saya),
 * dan input tersembunyi name="latitude" / name="longitude".
 */
import { BEKASI, createMap, whenVisible } from './peta'

function isInside (lng: number, lat: number): boolean {
  const [[west, south], [east, north]] = BEKASI
  return lng >= west && lng <= east && lat >= south && lat <= north
}

export function mountLocationPicker (root: HTMLElement): { picker: HTMLElement, inside: () => boolean } {
  const picker = root.querySelector<HTMLElement>('[data-picker]')!
  const coords = root.querySelector<HTMLElement>('[data-coords]')!
  const latInput = root.querySelector<HTMLInputElement>('input[name="latitude"]')!
  const lngInput = root.querySelector<HTMLInputElement>('input[name="longitude"]')!

  const setPoint = (lng: number, lat: number) => {
    latInput.value = lat.toFixed(7)
    lngInput.value = lng.toFixed(7)
    const inside = isInside(lng, lat)
    coords.textContent = inside
      ? `Titik dipilih: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
      : 'Titik berada di luar Kota Bekasi. Pastikan letaknya sudah benar.'
    coords.classList.toggle('text-meter', !inside)
    picker.removeAttribute('aria-invalid')
  }

  let placeMarker: ((lng: number, lat: number) => void) | undefined
  whenVisible(picker, async () => {
    try {
      const { map, maplibre } = await createMap(picker)
      picker.querySelector('[data-map-status]')?.remove()
      const marker = new maplibre.Marker({ color: '#c2182b', draggable: true })
      placeMarker = (lng, lat) => {
        marker.setLngLat([lng, lat]).addTo(map)
        setPoint(lng, lat)
      }
      map.on('click', event => placeMarker!(event.lngLat.lng, event.lngLat.lat))
      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat()
        setPoint(lng, lat)
      })
      if (latInput.value) {
        placeMarker(Number(lngInput.value), Number(latInput.value))
      }
    } catch {
      const status = picker.querySelector('[data-map-status]')
      if (status) {
        status.textContent = 'Peta belum dapat dimuat. Gunakan tombol lokasi saya di bawah.'
      }
    }
  })

  root.querySelector<HTMLButtonElement>('[data-locate]')?.addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
      coords.textContent = 'Perangkat ini tidak mendukung penentuan lokasi.'
      return
    }
    coords.textContent = 'Mencari lokasi Anda…'
    navigator.geolocation.getCurrentPosition(position => {
      const { longitude, latitude } = position.coords
      if (placeMarker) {
        placeMarker(longitude, latitude)
      } else {
        setPoint(longitude, latitude)
      }
    }, () => {
      coords.textContent = 'Lokasi tidak dapat diakses. Izinkan akses lokasi atau ketuk titik pada peta.'
    }, { enableHighAccuracy: true, timeout: 15_000 })
  })

  return {
    picker,
    inside: () => Boolean(latInput.value) && isInside(Number(lngInput.value), Number(latInput.value)),
  }
}
