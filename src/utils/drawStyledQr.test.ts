import { describe, expect, it, vi } from 'vitest'
import { createDefaultQrStyle } from '../qrStyle'
import { drawStyledQr } from './drawStyledQr'

function mockContext(overrides: Record<string, unknown> = {}) {
  return {
    fillStyle: '',
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    clip: vi.fn(),
    rect: vi.fn(),
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
    expect(ctx.fillRect).toHaveBeenCalledWith(100, 100, 10, 10)
  })

  it('draws each finder as one concentric circle group', () => {
    const ctx = mockContext()
    const style = createDefaultQrStyle()
    style.finder.outerShape = 'circle'
    style.finder.centerShape = 'circle'
    style.finder.outerColor = '#ff0000'
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 0 },
      { resolution: 210, margin: 0, style },
    )
    expect(ctx.arc).toHaveBeenCalledWith(35, 35, 35, 0, Math.PI * 2)
    expect(ctx.arc).toHaveBeenCalledWith(35, 35, 25, 0, Math.PI * 2)
    expect(ctx.arc).toHaveBeenCalledWith(35, 35, 15, 0, Math.PI * 2)
    expect(ctx.arc).toHaveBeenCalledTimes(9)
  })

  it('draws finder pupils with roundRect when the center is rounded', () => {
    const ctx = mockContext()
    const style = createDefaultQrStyle()
    style.finder.centerShape = 'rounded'
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 0 },
      { resolution: 210, margin: 0, style },
    )
    expect(ctx.roundRect).toHaveBeenCalledTimes(3)
  })

  it('falls back to a path when roundRect is missing', () => {
    const ctx = mockContext({ roundRect: undefined })
    const style = createDefaultQrStyle()
    style.finder.centerShape = 'rounded'
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 0 },
      { resolution: 210, margin: 0, style },
    )
    expect(ctx.quadraticCurveTo).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('draws triangular finders as a single triangle group', () => {
    const ctx = mockContext()
    const style = createDefaultQrStyle()
    style.finder.outerShape = 'triangle'
    style.finder.centerShape = 'triangle'
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 0 },
      { resolution: 210, margin: 0, style },
    )
    expect(ctx.moveTo).toHaveBeenCalledWith(35, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(70, 70)
    expect(ctx.lineTo).toHaveBeenCalledWith(0, 70)
  })

  it('does not paint finder inner rings as data modules', () => {
    const ctx = mockContext()
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      {
        size: 21,
        get: (row, col) => (row === 1 && col === 1 ? 1 : 0),
      },
      { resolution: 210, margin: 0, style: createDefaultQrStyle() },
    )
    expect(ctx.fillRect).not.toHaveBeenCalledWith(10, 10, 10, 10)
  })

  it('grows the finder mark around its center above 100%', () => {
    const ctx = mockContext()
    const style = createDefaultQrStyle()
    style.finder.outerShape = 'circle'
    style.finder.centerShape = 'circle'
    style.finder.scale = 120
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 0 },
      { resolution: 210, margin: 0, style },
    )
    expect(ctx.arc).toHaveBeenCalledWith(35, 35, 42, 0, Math.PI * 2)
    expect(ctx.arc).toHaveBeenCalledWith(35, 35, 30, 0, Math.PI * 2)
    expect(ctx.arc).toHaveBeenCalledWith(35, 35, 18, 0, Math.PI * 2)
  })

  it('shrinks the finder mark around its center below 100%', () => {
    const ctx = mockContext()
    const style = createDefaultQrStyle()
    style.finder.scale = 60
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 0 },
      { resolution: 210, margin: 0, style },
    )
    expect(ctx.fillRect).toHaveBeenCalledWith(14, 14, 42, 42)
  })

  it('shrinks the alignment mark around its own center', () => {
    const ctx = mockContext()
    const style = createDefaultQrStyle()
    style.alignment.shape = 'circle'
    style.alignment.scale = 60
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 25, get: () => 0 },
      { resolution: 250, margin: 0, style },
    )
    expect(ctx.arc).toHaveBeenCalledWith(185, 185, 15, 0, Math.PI * 2)
  })

  it('styles alignment as a group and timing modules individually', () => {
    const ctx = mockContext()
    const style = createDefaultQrStyle()
    style.alignment.shape = 'circle'
    style.timing.color = '#aa00aa'
    style.timing.shape = 'circle'
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      {
        size: 25,
        get: (row, col) => (row === 6 && col === 10 ? 1 : 0),
      },
      { resolution: 250, margin: 0, style },
    )
    expect(ctx.arc).toHaveBeenCalled()
    expect(ctx.arc).toHaveBeenCalledWith(105, 65, 5, 0, Math.PI * 2)
  })
})
