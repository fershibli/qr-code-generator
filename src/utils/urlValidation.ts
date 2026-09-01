export type UrlStatus = 'empty' | 'valid' | 'invalid'

export type UrlCheck = {
  status: UrlStatus
  message: string
}

/** Scheme with nothing after it, which is what the field starts out holding. */
const SCHEME_ONLY = /^[a-z][a-z0-9+.-]*:(\/\/)?$/i
const WEB_SCHEME = /^https?:$/

/**
 * Checks the typed destination without touching the network: `empty` while it
 * still holds nothing but the scheme, then `valid` or `invalid` with a reason
 * the field can show.
 */
export function checkUrl(value: string): UrlCheck {
  const url = value.trim()

  if (!url || SCHEME_ONLY.test(url)) {
    return { status: 'empty', message: '' }
  }

  if (/\s/.test(url)) {
    return { status: 'invalid', message: 'A URL cannot contain spaces.' }
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return {
      status: 'invalid',
      message: 'Start with a scheme, such as https://example.com.',
    }
  }

  if (!WEB_SCHEME.test(parsed.protocol)) {
    return {
      status: 'valid',
      message: `Valid ${parsed.protocol.replace(':', '')} link. Scanners may not open it as a web page.`,
    }
  }

  // http(s) never parses with an empty host, so only its shape needs checking.
  const host = parsed.hostname
  const knownHost = host === 'localhost' || host.endsWith('.localhost')
  if (!knownHost && !/^[^.]+(\.[^.]+)+$/.test(host)) {
    return {
      status: 'invalid',
      message: 'Add a domain ending, such as .com.',
    }
  }

  if (!knownHost && /^[.-]|[.-]$|\.\./.test(host)) {
    return { status: 'invalid', message: 'That domain is not well formed.' }
  }

  return { status: 'valid', message: `Valid URL — points to ${host}.` }
}
