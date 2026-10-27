/**
 * Peta interaktif (MapLibre) untuk jaringan pipa dan pemilih lokasi pendaftaran.
 *  - peta dasar: OpenFreeMap "positron" (tanpa kunci API)
 *  - jaringan pipa: vector tile pg_tileserv layer jaringan.pipa (PostGIS); hanya garis dan diameternya yang ditampilkan
 *  - batas kecamatan: GeoJSON yang sama dengan peta layanan statis
 * MapLibre dimuat saat peta pertama kali terlihat agar halaman tetap ringan.
 */
import type { ExpressionSpecification, Map as MapLibreMap, StyleSpecification } from 'maplibre-gl'
import kecamatanUrl from '../data/geo/kecamatan.json?url'

export const BASEMAP = import.meta.env.PUBLIC_BASEMAP_STYLE || 'https://tiles.openfreemap.org/styles/positron'
export const PIPA_TILES = (import.meta.env.PUBLIC_PIPA_TILES || 'https://tile.api.tirtapatriot.com').replace(/\/+$/, '') + '/jaringan.pipa/{z}/{x}/{y}.pbf'

/** Batas Kota Bekasi (dari jaringan.pipa & batas kecamatan) */
export const BEKASI: [[number, number], [number, number]] = [[106.9, -6.385], [107.05, -6.165]]

// selaras dengan token --color-pipa dan --color-patriot
const PIPA_UTAMA = '#0a2a5e'
const PIPA_DISTRIBUSI = '#0b6fb8'
/** Pipa berdiameter ini ke atas digambar sebagai pipa utama (transmisi dan distribusi induk). */
export const DIAMETER_UTAMA = 250

type MapLibre = typeof import('maplibre-gl')

let loader: Promise<MapLibre> | undefined

export function loadMapLibre (): Promise<MapLibre> {
  loader ??= Promise.all([
    import('maplibre-gl'),
    // MapLibre 6 memuat worker dari berkas terpisah; Vite membundelnya agar ikut ter-hash di /_astro
    import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'),
    import('maplibre-gl/dist/maplibre-gl.css'),
  ]).then(([module, worker]) => {
    module.setWorkerUrl(worker.default)
    return module
  })
  return loader
}

/** Panggil callback saat elemen mendekati layar (sekali saja). */
export function whenVisible (element: Element, callback: () => void): void {
  if (!('IntersectionObserver' in window)) {
    callback()
    return
  }
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer.disconnect()
      callback()
    }
  }, { rootMargin: '200px' })
  observer.observe(element)
}

export async function createMap (container: HTMLElement, options: { interactive?: boolean } = {}): Promise<{ map: MapLibreMap, maplibre: MapLibre }> {
  const maplibre = await loadMapLibre()
  const map = new maplibre.Map({
    container,
    style: BASEMAP as string | StyleSpecification,
    bounds: BEKASI,
    maxBounds: [[106.75, -6.5], [107.2, -6.05]],
    minZoom: 10,
    maxZoom: 19,
    cooperativeGestures: true,
    attributionControl: { compact: true, customAttribution: 'Jaringan pipa © Perumda Tirta Patriot' },
    interactive: options.interactive ?? true,
    locale: {
      'NavigationControl.ZoomIn': 'Perbesar',
      'NavigationControl.ZoomOut': 'Perkecil',
      'NavigationControl.ResetBearing': 'Arah utara',
      'GeolocateControl.FindMyLocation': 'Lokasi saya',
      'GeolocateControl.LocationNotAvailable': 'Lokasi tidak tersedia',
      'CooperativeGesturesHandler.WindowsHelpText': 'Gunakan Ctrl + gulir untuk memperbesar peta',
      'CooperativeGesturesHandler.MacHelpText': 'Gunakan ⌘ + gulir untuk memperbesar peta',
      'CooperativeGesturesHandler.MobileHelpText': 'Gunakan dua jari untuk menggeser peta',
      'AttributionControl.ToggleAttribution': 'Sumber peta',
    },
  })
  map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right')
  await new Promise<void>(resolve => map.once('load', () => resolve()))
  addKecamatan(map)
  addPipa(map)
  return { map, maplibre }
}

function addKecamatan (map: MapLibreMap): void {
  map.addSource('kecamatan', { type: 'geojson', data: kecamatanUrl })
  map.addLayer({
    id: 'kecamatan-batas',
    type: 'line',
    source: 'kecamatan',
    paint: { 'line-color': '#4b5d75', 'line-width': 1.2, 'line-dasharray': [3, 2], 'line-opacity': 0.7 },
  })
  map.addLayer({
    id: 'kecamatan-label',
    type: 'symbol',
    source: 'kecamatan',
    maxzoom: 14,
    layout: {
      'text-field': ['get', 'nama'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 12,
      'text-transform': 'uppercase',
      'text-letter-spacing': 0.08,
    },
    paint: { 'text-color': '#4b5d75', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 },
  })
}

function addPipa (map: MapLibreMap): void {
  map.addSource('pipa', {
    type: 'vector',
    tiles: [PIPA_TILES],
    bounds: [106.908, -6.38, 107.042, -6.172],
    minzoom: 10,
    maxzoom: 16,
    attribution: '',
  })

  const diameter: ExpressionSpecification = ['coalesce', ['get', 'diameter'], 0]
  // pipa dinas (sambungan ke rumah) tidak ditampilkan
  const visible: ExpressionSpecification = ['!=', ['coalesce', ['get', 'jenisjaringan'], ''], 'Dinas']

  map.addLayer({
    id: 'pipa-distribusi',
    type: 'line',
    source: 'pipa',
    'source-layer': 'jaringan.pipa',
    filter: ['all', visible, ['<', diameter, DIAMETER_UTAMA]],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': PIPA_DISTRIBUSI,
      'line-opacity': 0.85,
      'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.6, 14, 1.4, 17, 3],
    },
  })
  map.addLayer({
    id: 'pipa-utama',
    type: 'line',
    source: 'pipa',
    'source-layer': 'jaringan.pipa',
    filter: ['all', visible, ['>=', diameter, DIAMETER_UTAMA]],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': PIPA_UTAMA,
      'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1.8, 14, 3, 17, 6],
    },
  })
}

/** Keterangan singkat satu ruas pipa untuk tooltip: hanya jenis dan diameter. */
export function pipaLabel (properties: Record<string, unknown>): string {
  const diameter = Number(properties.diameter)
  const jenis = diameter >= DIAMETER_UTAMA ? 'Pipa utama' : 'Pipa distribusi'
  return Number.isFinite(diameter) && diameter > 0 ? `${jenis}, diameter ${diameter} mm` : jenis
}

export function bindPipaTooltip (map: MapLibreMap, maplibre: MapLibre): void {
  const popup = new maplibre.Popup({ closeButton: false, closeOnClick: false, offset: 8, className: 'peta-tooltip' })
  for (const layer of ['pipa-utama', 'pipa-distribusi']) {
    map.on('mousemove', layer, event => {
      const feature = event.features?.[0]
      if (!feature) {
        return
      }
      map.getCanvas().style.cursor = 'pointer'
      popup.setLngLat(event.lngLat).setText(pipaLabel(feature.properties)).addTo(map)
    })
    map.on('mouseleave', layer, () => {
      map.getCanvas().style.cursor = ''
      popup.remove()
    })
  }
}
