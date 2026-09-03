import { describe, expect, it } from 'vitest'
import {
  MAX_QR_VERSION,
  MAX_RESOLUTION_PX,
  MIN_QR_VERSION,
  MIN_RESOLUTION_PX,
  PIXELS_PER_INCH,
  advancedResolutionToPixels,
  clampQrVersion,
  clampResolutionPx,
  convertResolution,
  modulesForVersion,
  pixelsToUnit,
  resolutionBoundsIn,
  roundForUnit,
  unitToPixels,
  versionForModules,
} from './constants'

describe('QR version helpers', () => {
  it('maps versions to their module count', () => {
    expect(modulesForVersion(1)).toBe(21)
    expect(modulesForVersion(10)).toBe(57)
    expect(modulesForVersion(MAX_QR_VERSION)).toBe(177)
  })

  it('maps module counts back to their version', () => {
    expect(versionForModules(21)).toBe(1)
    expect(versionForModules(177)).toBe(MAX_QR_VERSION)
    expect(versionForModules(modulesForVersion(23))).toBe(23)
  })

  it('clamps and rounds versions into the supported range', () => {
    expect(clampQrVersion(0)).toBe(MIN_QR_VERSION)
    expect(clampQrVersion(-5)).toBe(MIN_QR_VERSION)
    expect(clampQrVersion(99)).toBe(MAX_QR_VERSION)
    expect(clampQrVersion(7.4)).toBe(7)
  })
})

describe('resolution unit helpers', () => {
  it('converts each unit against the CSS reference density', () => {
    expect(unitToPixels(1, 'px')).toBe(1)
    expect(unitToPixels(1, 'in')).toBe(PIXELS_PER_INCH)
    expect(unitToPixels(2.54, 'cm')).toBeCloseTo(PIXELS_PER_INCH, 6)
    expect(unitToPixels(25.4, 'mm')).toBeCloseTo(PIXELS_PER_INCH, 6)
    expect(unitToPixels(72, 'pt')).toBeCloseTo(PIXELS_PER_INCH, 6)
    expect(unitToPixels(6, 'pc')).toBeCloseTo(PIXELS_PER_INCH, 6)
  })

  it('round-trips a pixel size through any unit', () => {
    expect(unitToPixels(pixelsToUnit(500, 'mm'), 'mm')).toBeCloseTo(500, 6)
    expect(unitToPixels(pixelsToUnit(500, 'in'), 'in')).toBeCloseTo(500, 6)
  })

  it('rounds to the precision each unit is edited at', () => {
    expect(roundForUnit(499.6, 'px')).toBe(500)
    expect(roundForUnit(5.2916, 'cm')).toBe(5.29)
    expect(roundForUnit(132.28, 'mm')).toBe(132.3)
  })

  it('keeps the physical size when the unit changes', () => {
    const converted = convertResolution(
      { width: 500, height: 750, unit: 'px' },
      'in',
    )
    expect(converted.unit).toBe('in')
    expect(converted.width).toBeCloseTo(5.21, 2)
    expect(converted.height).toBeCloseTo(7.81, 2)
  })

  it('returns the same resolution when the unit does not change', () => {
    const resolution = { width: 500, height: 500, unit: 'px' } as const
    expect(convertResolution(resolution, 'px')).toBe(resolution)
  })

  it('states the pixel limits in the selected unit', () => {
    expect(resolutionBoundsIn('px')).toEqual({
      min: MIN_RESOLUTION_PX,
      max: MAX_RESOLUTION_PX,
    })
    const inches = resolutionBoundsIn('in')
    expect(inches.min).toBeCloseTo(MIN_RESOLUTION_PX / PIXELS_PER_INCH, 2)
    expect(inches.max).toBeCloseTo(MAX_RESOLUTION_PX / PIXELS_PER_INCH, 2)
  })

  it('clamps and rounds the canvas side', () => {
    expect(clampResolutionPx(10)).toBe(MIN_RESOLUTION_PX)
    expect(clampResolutionPx(99999)).toBe(MAX_RESOLUTION_PX)
    expect(clampResolutionPx(500.6)).toBe(501)
    expect(clampResolutionPx(Number.NaN)).toBe(500)
  })

  it('turns an advanced resolution into whole pixels', () => {
    expect(
      advancedResolutionToPixels({ width: 2, height: 3, unit: 'in' }),
    ).toEqual({ width: 192, height: 288 })
    expect(
      advancedResolutionToPixels({ width: 0.1, height: 500, unit: 'px' }),
    ).toEqual({ width: MIN_RESOLUTION_PX, height: 500 })
  })
})
