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
})
