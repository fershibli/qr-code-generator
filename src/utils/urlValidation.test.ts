import { describe, expect, it } from 'vitest'
import { checkUrl } from './urlValidation'

describe('checkUrl', () => {
  it('treats nothing, and the bare scheme the field starts with, as empty', () => {
    expect(checkUrl('').status).toBe('empty')
    expect(checkUrl('   ').status).toBe('empty')
    expect(checkUrl('https://').status).toBe('empty')
    expect(checkUrl('http://').status).toBe('empty')
    expect(checkUrl('mailto:').status).toBe('empty')
  })

  it('accepts ordinary web addresses', () => {
    expect(checkUrl('https://a.com.br')).toEqual({
      status: 'valid',
      message: 'Valid URL — points to a.com.br.',
    })
    expect(checkUrl('http://example.com/path?q=1#top').status).toBe('valid')
    expect(checkUrl('https://sub.domain.example.co.uk').status).toBe('valid')
    expect(checkUrl('  https://example.com  ').status).toBe('valid')
  })

  it('accepts localhost, which has no domain ending', () => {
    expect(checkUrl('http://localhost:5173').status).toBe('valid')
    expect(checkUrl('http://app.localhost').status).toBe('valid')
  })

  it('accepts other schemes but says scanners may not open them', () => {
    const check = checkUrl('mailto:someone@example.com')
    expect(check.status).toBe('valid')
    expect(check.message).toMatch(/may not open it as a web page/)
  })

  it('rejects text that is not a URL', () => {
    expect(checkUrl('example.com')).toEqual({
      status: 'invalid',
      message: 'Start with a scheme, such as https://example.com.',
    })
    expect(checkUrl('just some text').status).toBe('invalid')
  })

  it('rejects spaces', () => {
    expect(checkUrl('https://exa mple.com')).toEqual({
      status: 'invalid',
      message: 'A URL cannot contain spaces.',
    })
  })

  it('rejects a host with no domain ending', () => {
    expect(checkUrl('https://example')).toEqual({
      status: 'invalid',
      message: 'Add a domain ending, such as .com.',
    })
  })

  it('rejects a malformed domain', () => {
    expect(checkUrl('https://example..com').status).toBe('invalid')
    expect(checkUrl('https://.example.com').status).toBe('invalid')
    expect(checkUrl('https://example.com-').status).toBe('invalid')
  })
})
