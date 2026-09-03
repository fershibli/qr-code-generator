import { beforeEach, describe, expect, it, vi } from 'vitest'
import { modulesForVersion } from '../constants'
import { createDefaultQrStyle } from '../qrStyle'
import { generateQrPng } from './generateQrPng'

const { create } = vi.hoisted(() => ({ create: vi.fn() }))

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

vi.mock('qrcode', () => ({ default: { create } }))

/** Mirrors the library: the requested version wins, otherwise version 1. */
function autoVersionOf(size: number) {
  return (options?: { version?: number }) => ({
    modules: mockModules(
      options?.version ? modulesForVersion(options.version) : size,
    ),
  })
}

describe('generateQrPng', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    create.mockImplementation((_url: string, options?: { version?: number }) =>
      autoVersionOf(21)(options),
    )
  })

  it('returns a blob and object URL at the requested resolution', async () => {
    const result = await generateQrPng({
      url: 'https://example.com',
      size: 20,
      width: 250,
      margin: 2,
      logoPadding: 5,
    })
    expect(result.width).toBe(250)
    expect(result.height).toBe(250)
    expect(result.blob.type).toBe('image/png')
    expect(result.objectUrl).toMatch(/^blob:/)
    expect(result.version).toBe(1)
    expect(result.moduleCount).toBe(21)
  })

  it('reports the requested size for a rectangular export', async () => {
    const result = await generateQrPng({
      url: 'https://example.com',
      size: 20,
      width: 250,
      height: 400,
      margin: 2,
      logoPadding: 5,
    })
    expect(result.width).toBe(250)
    expect(result.height).toBe(400)
    expect(result.blob.type).toBe('image/png')
  })

  it('keeps the automatic version when it already fits the density', async () => {
    const result = await generateQrPng({
      url: 'https://example.com',
      size: 20,
      width: 250,
      margin: 2,
      logoPadding: 5,
      minVersion: 1,
    })
    expect(create).toHaveBeenCalledTimes(1)
    expect(result.version).toBe(1)
  })

  it('re-encodes at the requested version for a denser matrix', async () => {
    const result = await generateQrPng({
      url: 'https://example.com',
      size: 20,
      width: 250,
      margin: 2,
      logoPadding: 5,
      minVersion: 10,
    })
    expect(create).toHaveBeenLastCalledWith('https://example.com', {
      errorCorrectionLevel: 'H',
      version: 10,
    })
    expect(result.version).toBe(10)
    expect(result.moduleCount).toBe(57)
  })

  it('clamps a requested version to the supported range', async () => {
    await generateQrPng({
      url: 'https://example.com',
      size: 20,
      width: 250,
      margin: 2,
      logoPadding: 5,
      minVersion: 99,
    })
    expect(create).toHaveBeenLastCalledWith('https://example.com', {
      errorCorrectionLevel: 'H',
      version: 40,
    })
  })

  it('keeps the automatic version when the payload needs more room', async () => {
    create.mockImplementation((_url: string, options?: { version?: number }) =>
      autoVersionOf(modulesForVersion(12))(options),
    )
    const result = await generateQrPng({
      url: 'https://example.com/a-long-payload',
      size: 20,
      width: 250,
      margin: 2,
      logoPadding: 5,
      minVersion: 5,
    })
    expect(create).toHaveBeenCalledTimes(1)
    expect(result.version).toBe(12)
  })

  it('draws a centered logo when a file is provided', async () => {
    const logo = new File([new Uint8Array([1, 2, 3])], 'logo.png', {
      type: 'image/png',
    })
    const result = await generateQrPng({
      url: 'https://example.com',
      logoFile: logo,
      size: 20,
      width: 250,
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
        width: 250,
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
        width: 250,
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
      const ctx = original.apply(this, args) as CanvasRenderingContext2D | null
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
      width: 250,
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

  it('keeps the logo proportional to the code inside a contour', async () => {
    const fillRect = vi.fn()
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function getContext(
      this: HTMLCanvasElement,
      ...args: Parameters<HTMLCanvasElement['getContext']>
    ) {
      const ctx = original.apply(this, args) as CanvasRenderingContext2D | null
      if (ctx) {
        ctx.fillRect = fillRect
      }
      return ctx
    } as HTMLCanvasElement['getContext']

    const style = createDefaultQrStyle()
    style.contour = { ...style.contour, enabled: true, width: 6 }
    await generateQrPng({
      url: 'https://example.com',
      logoFile: new File([new Uint8Array([1, 2, 3])], 'logo.png', {
        type: 'image/png',
      }),
      size: 20,
      width: 250,
      margin: 2,
      logoPadding: 10,
      style,
    })

    // 21 modules + 2 margin + 6 contour per side => the code is 25/37 of
    // 250 px, so a 20% logo with 10% padding is 40.5 px instead of 60 px.
    const backing = fillRect.mock.calls.at(-1) as number[]
    expect(backing[2]).toBeCloseTo(40.54, 1)
    expect(backing[0]).toBeCloseTo(104.73, 1)

    HTMLCanvasElement.prototype.getContext = original
  })
})
