import { describe, expect, it, vi } from 'vitest'
import { createDefaultQrStyle } from '../qrStyle'
import { drawStyledQr } from './drawStyledQr'

function mockContext(overrides: Record<string, unknown> = {}) {
  return {
    fillStyle: '',
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    quadraticCurveTo: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    ...overrides,
  }
}

describe('drawStyledQr', () => {
  it('fills the canvas with the quiet zone color', () => {
    const ctx = mockContext()
    const style = createDefaultQrStyle()
    style.quietZoneColor = '#abcdef'
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 0 },
      { resolution: 100, margin: 2, style },
    )
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 100, 100)
    expect(ctx.fillStyle).toBe('#abcdef')
  })

  it('draws dark data modules as squares in the data color', () => {
    const ctx = mockContext()
    const style = createDefaultQrStyle()
    style.dataColor = '#112233'
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      {
        size: 21,
        get: (row, col) => (row === 10 && col === 10 ? 1 : 0),
      },
      { resolution: 210, margin: 0, style },
    )
    expect(ctx.fillStyle).toBe('#112233')
    expect(ctx.fillRect).toHaveBeenCalledWith(100, 100, 10, 10)
  })

  it('draws finder outer modules with a circle', () => {
    const ctx = mockContext()
    const style = createDefaultQrStyle()
    style.finder.outerShape = 'circle'
    style.finder.outerColor = '#ff0000'
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      {
        size: 21,
        get: (row, col) => (row === 0 && col === 0 ? 1 : 0),
      },
      { resolution: 210, margin: 0, style },
    )
    expect(ctx.fillStyle).toBe('#ff0000')
    expect(ctx.arc).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('draws finder center modules with roundRect when available', () => {
    const ctx = mockContext()
    const style = createDefaultQrStyle()
    style.finder.centerShape = 'rounded'
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      {
        size: 21,
        get: (row, col) => (row === 3 && col === 3 ? 1 : 0),
      },
      { resolution: 210, margin: 0, style },
    )
    expect(ctx.roundRect).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('falls back to a path when roundRect is missing', () => {
    const ctx = mockContext({ roundRect: undefined })
    const style = createDefaultQrStyle()
    style.finder.centerShape = 'rounded'
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      {
        size: 21,
        get: (row, col) => (row === 3 && col === 3 ? 1 : 0),
      },
      { resolution: 210, margin: 0, style },
    )
    expect(ctx.quadraticCurveTo).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('skips light rings even when the matrix bit is set', () => {
    const ctx = mockContext()
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      {
        size: 21,
        get: (row, col) => (row === 1 && col === 1 ? 1 : 0),
      },
      { resolution: 210, margin: 0, style: createDefaultQrStyle() },
    )
    expect(ctx.fillRect).toHaveBeenCalledTimes(1)
    expect(ctx.arc).not.toHaveBeenCalled()
  })

  it('styles alignment and timing modules on version 2', () => {
    const ctx = mockContext()
    const style = createDefaultQrStyle()
    style.alignment.outerColor = '#00aa00'
    style.alignment.centerColor = '#0000aa'
    style.alignment.shape = 'circle'
    style.timing.color = '#aa00aa'
    style.timing.shape = 'circle'
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      {
        size: 25,
        get: (row, col) =>
          (row === 16 && col === 16) ||
          (row === 18 && col === 18) ||
          (row === 6 && col === 10)
            ? 1
            : 0,
      },
      { resolution: 250, margin: 0, style },
    )
    expect(ctx.arc).toHaveBeenCalledTimes(3)
  })
})
