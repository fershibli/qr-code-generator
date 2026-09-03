import { describe, expect, it, vi } from 'vitest'
import { createDefaultQrStyle } from '../qrStyle'
import { classifyQrModules } from './classifyQrModules'
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

function contourStyle(overrides: Partial<ReturnType<typeof createDefaultQrStyle>['contour']> = {}) {
  const style = createDefaultQrStyle()
  style.contour = {
    ...style.contour,
    enabled: true,
    color: '#ff0000',
    width: 4,
    ...overrides,
  }
  return style
}

/**
 * Records every filled rect with the color it was painted in, so contour
 * modules (red in these tests) can be told apart from the code itself.
 */
function trackFills(ctx: ReturnType<typeof mockContext>) {
  const fills: Array<{ x: number; y: number; w: number; h: number; color: string }> =
    []
  ctx.fillRect = vi.fn((x: number, y: number, w: number, h: number) => {
    fills.push({ x, y, w, h, color: String(ctx.fillStyle) })
  })
  return fills
}

/** Matrix that is dark only where `classifyQrModules` reports `kind`. */
function matrixOfKind(size: number, data: boolean) {
  const kinds = classifyQrModules(size)
  return {
    size,
    get: (row: number, col: number) =>
      (kinds[row]?.[col] === 'data') === data ? 1 : 0,
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

  it('returns the box the code occupies', () => {
    const ctx = mockContext()
    const plain = drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 0 },
      { resolution: 250, margin: 2, style: createDefaultQrStyle() },
    )
    expect(plain).toEqual({ origin: 0, size: 250 })

    const withContour = drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 0 },
      { resolution: 290, margin: 2, style: contourStyle({ width: 6 }) },
    )
    // 21 modules + 2 margin + 6 contour on each side = 37 modules.
    expect(withContour.origin).toBeCloseTo((290 / 37) * 6)
    expect(withContour.size).toBeCloseTo((290 / 37) * 25)
  })

  it('gaps the fill by the QR margin, down to nothing at zero', () => {
    const ctx = mockContext()
    const fills = trackFills(ctx)
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 1 },
      { resolution: 290, margin: 0, style: contourStyle({ width: 4 }) },
    )

    // 21 modules + 0 margin + 4 contour per side => 29 modules of 10 px, and
    // the code starts at 4 modules in, with the fill right up against it.
    const step = 290 / 29
    const contour = fills.filter((fill) => fill.color === '#ff0000')
    const touching = contour.filter(
      (fill) => Math.abs(fill.x + fill.w - step * 4) < 0.001,
    )
    expect(touching.length).toBeGreaterThan(0)
    expect(contour.every((fill) => fill.x < step * 4 - 0.001 || fill.x >= step * 25 - 0.001 || fill.y < step * 4 - 0.001 || fill.y >= step * 25 - 0.001)).toBe(true)
  })

  it('clips the contour fill to the chosen outline', () => {
    const ctx = mockContext()
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 1 },
      { resolution: 290, margin: 2, style: contourStyle() },
    )
    expect(ctx.save).toHaveBeenCalledTimes(1)
    expect(ctx.clip).toHaveBeenCalledTimes(1)
    expect(ctx.restore).toHaveBeenCalledTimes(1)
    expect(ctx.arc).toHaveBeenCalledWith(145, 145, 145, 0, Math.PI * 2)

    const square = mockContext()
    drawStyledQr(
      square as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 1 },
      { resolution: 290, margin: 2, style: contourStyle({ shape: 'square' }) },
    )
    expect(square.rect).toHaveBeenCalledWith(0, 0, 290, 290)

    const diamond = mockContext()
    drawStyledQr(
      diamond as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 1 },
      { resolution: 290, margin: 2, style: contourStyle({ shape: 'diamond' }) },
    )
    expect(diamond.moveTo).toHaveBeenCalledWith(145, 0)
    expect(diamond.lineTo).toHaveBeenCalledWith(290, 145)

    const rounded = mockContext()
    drawStyledQr(
      rounded as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 1 },
      { resolution: 290, margin: 2, style: contourStyle({ shape: 'rounded' }) },
    )
    expect(rounded.roundRect).toHaveBeenCalledWith(0, 0, 290, 290, 58)
  })

  it('keeps the contour fill clear of the code and its quiet zone', () => {
    const ctx = mockContext()
    const fills = trackFills(ctx)
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 1 },
      { resolution: 290, margin: 2, style: contourStyle({ width: 4 }) },
    )

    const contour = fills.filter((fill) => fill.color === '#ff0000')
    expect(contour.length).toBeGreaterThan(0)
    // 21 modules + 2 margin + 4 contour per side => 33 modules of 290/33 px.
    const step = 290 / 33
    const coreStart = step * 4
    const coreEnd = coreStart + step * 25
    const overlapping = contour.filter(
      ({ x, y, w, h }) =>
        x + w > coreStart + 0.001 &&
        x < coreEnd - 0.001 &&
        y + h > coreStart + 0.001 &&
        y < coreEnd - 0.001,
    )
    expect(overlapping).toHaveLength(0)
  })

  it('repeats the dark data modules in the contour fill', () => {
    const ctx = mockContext()
    const fills = trackFills(ctx)
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      matrixOfKind(21, true),
      { resolution: 290, margin: 2, style: contourStyle({ width: 4 }) },
    )
    expect(fills.filter((fill) => fill.color === '#ff0000').length).toBeGreaterThan(
      0,
    )
  })

  it('never repeats function patterns in the contour fill', () => {
    const ctx = mockContext()
    const fills = trackFills(ctx)
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      matrixOfKind(21, false),
      { resolution: 290, margin: 2, style: contourStyle({ width: 4 }) },
    )
    expect(fills.filter((fill) => fill.color === '#ff0000')).toHaveLength(0)
  })

  it('leaves no gap where a function pattern falls in the contour fill', () => {
    const ctx = mockContext()
    const fills = trackFills(ctx)
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      matrixOfKind(21, true),
      { resolution: 290, margin: 2, style: contourStyle({ width: 4 }) },
    )
    // Every data module is dark, so the substitutes drawn where the tiling hits
    // a function pattern are dark too: the whole band is painted, with no
    // finder- or timing-shaped holes left in it.
    // 21 modules + 2 margin + 4 contour per side => 33² lattice cells, minus
    // the 25² the code and its quiet zone take up.
    expect(fills.filter((fill) => fill.color === '#ff0000')).toHaveLength(
      33 * 33 - 25 * 25,
    )
  })

  it('draws the same contour fill every time for the same code', () => {
    const matrix = {
      size: 21,
      get: (row: number, col: number) =>
        ((row * 7 + col * 3) % 5 < 2 ? 1 : 0),
    }
    const draw = () => {
      const ctx = mockContext()
      const fills = trackFills(ctx)
      drawStyledQr(ctx as unknown as CanvasRenderingContext2D, matrix, {
        resolution: 290,
        margin: 2,
        style: contourStyle({ width: 4 }),
      })
      return fills.filter((fill) => fill.color === '#ff0000')
    }
    const first = draw()
    expect(first.length).toBeGreaterThan(0)
    expect(draw()).toEqual(first)
  })

  it('leaves the canvas untouched by the contour when it is off', () => {
    const ctx = mockContext()
    drawStyledQr(
      ctx as unknown as CanvasRenderingContext2D,
      { size: 21, get: () => 1 },
      { resolution: 210, margin: 0, style: createDefaultQrStyle() },
    )
    expect(ctx.save).not.toHaveBeenCalled()
    expect(ctx.clip).not.toHaveBeenCalled()
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
