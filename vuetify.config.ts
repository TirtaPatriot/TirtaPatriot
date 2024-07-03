import { md3 } from 'vuetify/blueprints'
import { defineVuetifyConfiguration } from 'vuetify-nuxt-module/custom-configuration'
import { id } from 'vuetify/locale'

const bahasa = {
  ...id,
  ...{
    badge: 'Lencana',
    open: 'Buka',
    close: 'Tutup',
    dismiss: 'Singkirkan',
    confirmEdit: { ok: 'OK', cancel: 'Batal' },
    dataIterator: { noResultsText: 'Tidak ditemukan catatan yang cocok', loadingText: 'Memuat data...' },
    dataTable: { itemsPerPageText: 'Baris per halaman:', ariaLabel: { sortDescending: 'Diurutkan kebawah.', sortAscending: 'Diurutkan keatas.', sortNone: 'Tidak diurutkan.', activateNone: 'Aktifkan untuk menghapus penyortiran.', activateDescending: 'Aktifkan untuk mengurutkan kebawah.', activateAscending: 'Aktifkan untuk mengurutkan keatas.' }, sortBy: 'Urutkan berdasar' },
    dataFooter: { itemsPerPageText: 'Butir per halaman:', itemsPerPageAll: 'Semua', nextPage: 'Selanjutnya', prevPage: 'Sebelumnya', firstPage: 'Awal', lastPage: 'Akhir', pageText: '{0}-{1} dari {2}' },
    dateRangeInput: { divider: 'sampai' },
    datePicker: { itemsSelected: '{0} terpilih', range: { title: 'Pilih tanggal', header: 'Isi tanggal' }, title: 'Pilih tanggal', header: 'Isi tanggal', input: { placeholder: 'Isi tanggal' } },
    noDataText: 'Tidak ada data tersedia',
    carousel: { prev: 'Sebelumnya', next: 'Selanjutnya', ariaLabel: { delimiter: 'Visual {0} dari {1}' } },
    calendar: { moreEvents: '{0} lagi', today: 'Today' },
    input: { clear: 'Bersihkan {0}', prependAction: '{0} tindakan disisipkan diawal', appendAction: '{0} tindakan disisipkan diakhir', otp: 'Masukkan {0} karakter OTP' },
    fileInput: { counter: '{0} berkas', counterSize: '{0} berkas (dari total {1})' },
    timePicker: { am: 'AM', pm: 'PM', title: 'Pilih Waktu' },
    pagination: { ariaLabel: { root: 'Navigasi', next: 'Selanjutnya', previous: 'Sebelumnya', page: 'Buka halaman {0}', currentPage: 'Halaman Saat Ini, Halaman {0}', first: 'Awal', last: 'Akhir' } },
    stepper: { next: 'Selanjutnya', prev: 'Sebelumnya' },
    rating: { ariaLabel: { item: 'Nilai {0} dari {1}' } },
    loading: 'Memuat...',
    infiniteScroll: { loadMore: 'Muat lagi', empty: 'Tidak ada lagi' },
  },
}

export default defineVuetifyConfiguration({
  ssr: {
    clientWidth: 100,
  },
  // defaults: {
  //   VBtn: { color: 'blue' },
  // },
  // aliases: {
  //   MyBadge: 'VBadge',
  // },
  // directives: ['ClickOutside', 'Resize', 'Ripple'],
  // components: ['VDialog', 'VExpansionPanel', 'VExpansionPanelText', 'VExpansionPanelTitle'],
  // labComponents: ['VDataTable', 'VDatePickerControls', 'VDatePickerHeader'],
  blueprint: md3,
  locale: {
    locale: 'id',
    messages: { id: bahasa },
  },
  /* locale: {
    messages: {
      en: {
        hello: 'Hi',
        question: {
          one: 'One',
          two: 'Two',
        },
      },
      es: {
        hello: 'Hola',
        question: {
          one: 'Uno',
          two: 'Dos',
          three: 'Tres',
        },
      },
    },
  },
  localeMessages: ['en', 'es', 'ar'], */
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
      },
      dark: {
        dark: true,
      },
    },
  },
  date: {
    // adapter: 'date-fns',
    // adapter: 'luxon',
    adapter: 'vuetify',
  },
  icons: {
    // remember to comment the v-icon in playground/pages/index.vue when switching
    // defaultSet: 'fa-svg',
    // custom unocss-mdi icon set implementation: check custom-unocss-mdi.ts plugin
    // defaultSet: 'custom',
    defaultSet: 'custom',
    // sets: [
    //   {
    //     iconifyMdi,
    //   }
    // ],
    /* defaultSet: 'mdi',
    sets: [{
      name: 'mdi',
      cdn: 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css',
    }], */
    // defaultSet: 'unocss-mdi',
    // defaultSet: 'mdi-svg',
    /* svg: {
      mdi: {
        aliases: {
          account: 'mdiAccount',
        },
      },
    }, */
  },
})
