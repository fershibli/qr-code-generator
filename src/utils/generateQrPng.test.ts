import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateQrPng } from './generateQrPng'

function mockModules(size = 21) {
  return {
    size,
    get: (row: number, col: number) => {
      const onFinder =
        (row < 7 && col < 7) ||
        (row < 7 && col >= size - 7) ||
        (row >= size - 7 && col < 7)
      return onFinder || (row + col) % 2 === 0 ? 1 : 0
    },
  }
}

vi.mock('qrcode', () => ({
  default: {
    create: vi.fn(() => ({
      modules: mockModules(),
    })),
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
    HTMLCanvasElement.prototype.getContext = function getContext() {
      return null
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

  it('paints a quiet-zone backing behind the logo unless transparency is on', async () => {
    const fillRect = vi.fn()
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function getContext(
      this: HTMLCanvasElement,
      ...args: Parameters<HTMLCanvasElement['getContext']>
    ) {
      const ctx = original.apply(this, args)
      if (ctx) {
        ctx.fillRect = fillRect
      }
      return ctx
    } as HTMLCanvasElement['getContext']

    const logo = new File([new Uint8Array([1, 2, 3])], 'logo.png', {
      type: 'image/png',
    })
    const options = {
      url: 'https://example.com',
      logoFile: logo,
      size: 20,
      resolution: 250,
      margin: 2,
      logoPadding: 10,
    }

    await generateQrPng({ ...options, logoTransparentBackground: false })
    expect(fillRect).toHaveBeenCalledWith(95, 95, 60, 60)

    fillRect.mockClear()
    await generateQrPng({ ...options, logoTransparentBackground: true })
    expect(fillRect).not.toHaveBeenCalledWith(95, 95, 60, 60)

    HTMLCanvasElement.prototype.getContext = original
  })
})
