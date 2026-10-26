<script lang="ts" setup>
  /**
   * Renderer tunggal untuk konten dinamis dari CMS (markdown atau HTML editor WYSIWYG).
   * Diproses lewat MDC dengan plugin pengaman `app/mdc/rehype-content-guard.ts`:
   * hanya HTML yang aman dirender, tabel dan embed dibungkus agar muat di layar,
   * gambar dan tautan memakai komponen di `components/global/` (ProseA, ProseImg).
   */
  const props = withDefaults(defineProps<{
    value?: string | null
    /** `auto` mendeteksi HTML dari editor; paksa `markdown` atau `html` bila perlu. */
    format?: 'auto' | 'markdown' | 'html'
    size?: 'default' | 'lg'
    /** Sembunyikan judul pertama di konten bila sudah diwakili oleh header halaman. */
    omitLeadingHeading?: boolean
  }>(), {
    value: '',
    format: 'auto',
    size: 'default',
    omitLeadingHeading: false,
  })

  const BLOCK_HTML = /^\s*<(?:p|div|h[1-6]|ul|ol|table|figure|blockquote|section|article|details)\b/i

  const html = computed(() => {
    if (props.format === 'html') {
      return true
    }

    return props.format === 'auto' && BLOCK_HTML.test(props.value ?? '')
  })

  const prepared = computed(() => {
    const raw = String(props.value ?? '').trim()
    if (!raw || !html.value) {
      return raw
    }

    // HTML dijadikan satu blok agar baris kosong/indentasi tidak ditafsirkan sebagai markdown
    const flat = raw.replace(/\s*\n\s*/g, ' ')
    return `<div data-content-wrapper>${flat}</div>`
  })
</script>

<template>
  <!--
    Elemen akar milik sendiri: gaya scoped hanya menempel pada akar yang dirender komponen ini,
    sedangkan akar MDC dibungkus komponen async sehingga atribut scope-nya tidak sampai.
  -->
  <div
    v-if="prepared"
    class="content"
    :class="[`content--${size}`, { 'content--omit-heading': omitLeadingHeading }]"
  >
    <MDC class="content-body" :value="prepared" />
  </div>
</template>

<style scoped>
  .content {
    min-width: 0;
    font-size: 1rem;
    line-height: 1.75;
    color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
    overflow-wrap: break-word;
  }

  .content--lg {
    font-size: 1.125rem;
  }

  .content :deep(.content-body > :first-child) {
    margin-top: 0;
  }

  .content :deep(.content-body > :last-child) {
    margin-bottom: 0;
  }

  /* --- teks --- */
  .content :deep(p) {
    margin: 0 0 1.1em;
  }

  .content :deep(h1),
  .content :deep(h2),
  .content :deep(h3),
  .content :deep(h4) {
    margin: 1.8em 0 0.6em;
    font-weight: 700;
    line-height: 1.3;
    text-wrap: balance;
    scroll-margin-top: 88px;
  }

  .content :deep(h1) {
    font-size: 1.75em;
  }

  .content :deep(h2) {
    font-size: 1.4em;
  }

  .content :deep(h3) {
    font-size: 1.2em;
  }

  .content :deep(h4) {
    font-size: 1.05em;
  }

  .content :deep(a) {
    color: rgb(var(--v-theme-primary));
    text-decoration: underline;
    text-decoration-thickness: 0.08em;
    text-underline-offset: 0.2em;
    overflow-wrap: anywhere;
  }

  .content :deep(a:hover) {
    text-decoration-thickness: 0.14em;
  }

  /* tautan jangkar otomatis pada judul: tampil sebagai judul biasa, garis bawah hanya saat hover */
  .content :deep(:is(h1, h2, h3, h4) a) {
    color: inherit;
    text-decoration: none;
  }

  .content :deep(:is(h1, h2, h3, h4) a:hover) {
    text-decoration: underline;
  }

  .content :deep(mark) {
    padding: 0 0.2em;
    border-radius: 4px;
    background: rgba(var(--v-theme-warning), 0.3);
    color: inherit;
  }

  .content :deep(small) {
    font-size: 0.875em;
  }

  .content :deep(.content-align-center) {
    text-align: center;
  }

  .content :deep(.content-align-right) {
    text-align: right;
  }

  .content :deep(.content-align-left) {
    text-align: left;
  }

  .content :deep(.content-align-justify) {
    text-align: justify;
  }

  /* --- daftar --- */
  .content :deep(ul),
  .content :deep(ol) {
    margin: 0 0 1.1em;
    padding-inline-start: 1.5em;
  }

  .content :deep(li) {
    margin-bottom: 0.4em;
    padding-inline-start: 0.2em;
  }

  .content :deep(li::marker) {
    color: rgb(var(--v-theme-primary));
    font-weight: 700;
  }

  .content :deep(li > p) {
    margin: 0.3em 0;
  }

  .content :deep(li > :is(ul, ol)) {
    margin: 0.4em 0 0;
  }

  .content :deep(dt) {
    font-weight: 700;
  }

  .content :deep(dd) {
    margin: 0 0 0.8em 1.2em;
  }

  /* --- kutipan, garis, detail --- */
  .content :deep(blockquote) {
    margin: 1.5em 0;
    padding: 0.8em 1.25em;
    border-inline-start: 4px solid rgb(var(--v-theme-primary));
    border-radius: 0 12px 12px 0;
    background: rgba(var(--v-theme-primary), 0.07);
  }

  .content :deep(blockquote > :last-child) {
    margin-bottom: 0;
  }

  .content :deep(hr) {
    margin: 2em 0;
    border: 0;
    border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  .content :deep(details) {
    margin: 0 0 1em;
    padding: 0.6em 1em;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 12px;
  }

  .content :deep(summary) {
    font-weight: 600;
    cursor: pointer;
  }

  /* --- kode --- */
  .content :deep(code),
  .content :deep(kbd) {
    padding: 0.15em 0.4em;
    border-radius: 6px;
    background: rgba(var(--v-theme-on-background), 0.07);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.9em;
  }

  .content :deep(pre) {
    margin: 0 0 1.25em;
    padding: 1em;
    overflow-x: auto;
    border-radius: 12px;
    background: rgba(var(--v-theme-on-background), 0.07);
    line-height: 1.55;
  }

  .content :deep(pre code) {
    padding: 0;
    background: none;
  }

  /* --- gambar & media --- */
  .content :deep(img) {
    max-width: 100%;
    height: auto !important;
    border-radius: 12px;
  }

  .content :deep(video) {
    display: block;
    max-width: 100%;
    margin: 1.5em auto;
    border-radius: 12px;
  }

  .content :deep(.content-embed) {
    position: relative;
    margin: 1.5em 0;
    overflow: hidden;
    border-radius: 12px;
    background: #000;
    aspect-ratio: 16 / 9;
  }

  .content :deep(.content-embed iframe) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  /* --- tabel: bisa digeser horizontal di layar kecil --- */
  .content :deep(.content-table) {
    margin: 1.5em 0;
    overflow-x: auto;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 12px;
  }

  .content :deep(table) {
    width: 100%;
    min-width: 480px;
    border-collapse: collapse;
    font-size: 0.95em;
  }

  .content :deep(th),
  .content :deep(td) {
    padding: 0.65em 0.9em;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    text-align: start;
    vertical-align: top;
  }

  .content :deep(th) {
    background: rgba(var(--v-theme-primary), 0.08);
    font-weight: 600;
  }

  .content :deep(tr:last-child > td) {
    border-bottom: 0;
  }

  /* --- judul di dalam konten sudah diwakili header halaman --- */
  .content--omit-heading :deep(.content-body > :is(h1, h2, h3):first-child),
  .content--omit-heading :deep(.content-body > p:first-child > strong:only-child) {
    display: none;
  }
</style>
