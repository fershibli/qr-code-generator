const MAX_SLUG_LENGTH = 60
const FALLBACK_SLUG = 'qr-code'

/**
 * Turns the encoded URL into a file-name-safe slug: no scheme, no `www.`, no
 * trailing slash, accents folded, and anything else that is not a letter,
 * digit, dot, underscore or dash collapsed into a single dash.
 *
 * `https://a.com.br` becomes `a.com.br`.
 */
export function slugifyUrl(url: string): string {
  const slug = url
    .trim()
    .replace(/^[a-z][a-z0-9+.-]*:(\/\/)?/i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/[-.]+$/, '')

  return slug || FALLBACK_SLUG
}

/** File name for the downloaded PNG, e.g. `a.com.br-500px.png`. */
export function buildQrFileName(url: string, resolution: number): string {
  return `${slugifyUrl(url)}-${resolution}px.png`
}
