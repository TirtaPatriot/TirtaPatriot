export function useNumberFormat (
  value?: number | string | null,
  options?: Intl.NumberFormatOptions,
) {
  try {
    const numericValue = typeof value === 'string' ? Number(value) : value

    if (typeof numericValue !== 'number' || Number.isNaN(numericValue)) {
      return null
    }

    return new Intl.NumberFormat('id-ID', options).format(numericValue)
  } catch {
    return null
  }
}
