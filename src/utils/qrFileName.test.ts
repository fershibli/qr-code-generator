import { describe, expect, it } from 'vitest'
import { buildQrFileName, slugifyUrl } from './qrFileName'

describe('slugifyUrl', () => {
  it('drops the scheme, www, and the trailing slash', () => {
    expect(slugifyUrl('https://a.com.br')).toBe('a.com.br')
    expect(slugifyUrl('http://www.example.com/')).toBe('example.com')
    expect(slugifyUrl('https://example.com///')).toBe('example.com')
  })

  it('keeps the path and collapses everything unsafe into single dashes', () => {
    expect(slugifyUrl('https://example.com/blog/post-1')).toBe(
      'example.com-blog-post-1',
    )
    expect(slugifyUrl('https://example.com/search?q=qr code&page=2')).toBe(
      'example.com-search-q-qr-code-page-2',
    )
  })

  it('folds accents instead of dropping the letters', () => {
    expect(slugifyUrl('https://ação.com.br/olá')).toBe('acao.com.br-ola')
  })

  it('handles a scheme without a double slash', () => {
    expect(slugifyUrl('mailto:someone@example.com')).toBe(
      'someone-example.com',
    )
  })

  it('caps the length without leaving a trailing separator', () => {
    const slug = slugifyUrl(`https://example.com/${'a/'.repeat(60)}`)
    expect(slug.length).toBeLessThanOrEqual(60)
    expect(slug).not.toMatch(/[-.]$/)
  })

  it('falls back when nothing usable is left', () => {
    expect(slugifyUrl('')).toBe('qr-code')
    expect(slugifyUrl('https://')).toBe('qr-code')
    expect(slugifyUrl('   ///   ')).toBe('qr-code')
  })
})

describe('buildQrFileName', () => {
  it('joins the slug with the resolution', () => {
    expect(buildQrFileName('https://a.com.br', 500)).toBe('a.com.br-500px.png')
    expect(buildQrFileName('https://example.com/x', 1750)).toBe(
      'example.com-x-1750px.png',
    )
  })

  it('names both sides when the export is not square', () => {
    expect(buildQrFileName('https://a.com.br', 500, 750)).toBe(
      'a.com.br-500x750px.png',
    )
  })

  it('still names the file when the URL is unusable', () => {
    expect(buildQrFileName('', 250)).toBe('qr-code-250px.png')
  })
})
