import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateQrPng } from './generateQrPng'

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn(
      async (canvas: HTMLCanvasElement, _url: string, options: { width: number }) => {
        canvas.width = options.width
        canvas.height = options.width
      },
    ),
  },
}))

describe('generateQrPng', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a blob and object URL at the requested resolution', async () => {
    const result = await generateQrPng({
      url: 'https://example.com',
      size: 20,
      resolution: 250,
      margin: 2,
      logoPadding: 5,
    })
    expect(result.width).toBe(250)
    expect(result.height).toBe(250)
    expect(result.blob.type).toBe('image/png')
    expect(result.objectUrl).toMatch(/^blob:/)
  })

  it('draws a centered logo when a file is provided', async () => {
    const logo = new File([new Uint8Array([1, 2, 3])], 'logo.png', {
      type: 'image/png',
    })
    const result = await generateQrPng({
      url: 'https://example.com',
      logoFile: logo,
      size: 20,
      resolution: 250,
      margin: 1,
      logoPadding: 10,
    })
    expect(result.blob.size).toBeGreaterThan(0)
  })

  it('rejects when the logo image fails to load', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:error')
    const logo = new File([new Uint8Array([1])], 'logo.png', { type: 'image/png' })
    await expect(
      generateQrPng({
        url: 'https://example.com',
        logoFile: logo,
        size: 20,
        resolution: 250,
        margin: 2,
        logoPadding: 5,
      }),
    ).rejects.toThrow('Failed to load logo image')
  })

  it('throws when the output canvas has no context', async () => {
    const original = HTMLCanvasElement.prototype.getContext
    let calls = 0
    HTMLCanvasElement.prototype.getContext = function getContext(
      this: HTMLCanvasElement,
      ...args: Parameters<HTMLCanvasElement['getContext']>
    ) {
      calls += 1
      if (calls === 1) return null
      return original.apply(this, args)
    } as HTMLCanvasElement['getContext']

    await expect(
      generateQrPng({
        url: 'https://example.com',
        size: 20,
        resolution: 250,
        margin: 2,
        logoPadding: 5,
      }),
    ).rejects.toThrow('Could not get canvas context')

    HTMLCanvasElement.prototype.getContext = original
  })
})
