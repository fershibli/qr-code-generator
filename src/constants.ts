export const RESOLUTIONS = [250, 500, 750, 1000, 1250, 1500, 1750] as const

export type Resolution = (typeof RESOLUTIONS)[number]

export const PREVIEW_SIZE = 500
export const DEFAULT_RESOLUTION: Resolution = 500

/** Units the advanced resolution accepts for the exported PNG. */
export const RESOLUTION_UNITS = ['px', 'mm', 'cm', 'in', 'pt', 'pc'] as const

export type ResolutionUnit = (typeof RESOLUTION_UNITS)[number]

/** CSS reference density, the one browsers and design tools assume. */
export const PIXELS_PER_INCH = 96

type ResolutionUnitInfo = {
  label: string
  /** Pixels one unit is worth at {@link PIXELS_PER_INCH}. */
  pixels: number
  /** Arrow-key increment for the width and height fields. */
  step: number
  /** Decimals kept when a value is converted into this unit. */
  decimals: number
}

export const RESOLUTION_UNIT_INFO: Record<ResolutionUnit, ResolutionUnitInfo> =
  {
    px: { label: 'Pixels (px)', pixels: 1, step: 1, decimals: 0 },
    mm: {
      label: 'Millimeters (mm)',
      pixels: PIXELS_PER_INCH / 25.4,
      step: 1,
      decimals: 1,
    },
    cm: {
      label: 'Centimeters (cm)',
      pixels: PIXELS_PER_INCH / 2.54,
      step: 0.1,
      decimals: 2,
    },
    in: {
      label: 'Inches (in)',
      pixels: PIXELS_PER_INCH,
      step: 0.1,
      decimals: 2,
    },
    pt: {
      label: 'Points (pt)',
      pixels: PIXELS_PER_INCH / 72,
      step: 1,
      decimals: 1,
    },
    pc: {
      label: 'Picas (pc)',
      pixels: PIXELS_PER_INCH / 6,
      step: 0.5,
      decimals: 2,
    },
  }

export const DEFAULT_RESOLUTION_UNIT: ResolutionUnit = 'px'

export const MIN_RESOLUTION_PX = 64
export const MAX_RESOLUTION_PX = 4096

/** Width, height and unit behind the advanced resolution controls. */
export type AdvancedResolution = {
  width: number
  height: number
  unit: ResolutionUnit
}

export const DEFAULT_ADVANCED_RESOLUTION: AdvancedResolution = {
  width: DEFAULT_RESOLUTION,
  height: DEFAULT_RESOLUTION,
  unit: DEFAULT_RESOLUTION_UNIT,
}

export function unitToPixels(value: number, unit: ResolutionUnit): number {
  return value * RESOLUTION_UNIT_INFO[unit].pixels
}

export function pixelsToUnit(pixels: number, unit: ResolutionUnit): number {
  return pixels / RESOLUTION_UNIT_INFO[unit].pixels
}

/** Rounds to the precision the unit is edited at: 500 px reads as 5.29 cm. */
export function roundForUnit(value: number, unit: ResolutionUnit): number {
  const factor = 10 ** RESOLUTION_UNIT_INFO[unit].decimals
  return Math.round(value * factor) / factor
}

/** Smallest and largest value the unit can hold, at the pixel limits. */
export function resolutionBoundsIn(unit: ResolutionUnit) {
  return {
    min: roundForUnit(pixelsToUnit(MIN_RESOLUTION_PX, unit), unit),
    max: roundForUnit(pixelsToUnit(MAX_RESOLUTION_PX, unit), unit),
  }
}

/** Canvas side in whole pixels, kept inside the supported range. */
export function clampResolutionPx(pixels: number): number {
  if (!Number.isFinite(pixels)) return DEFAULT_RESOLUTION
  return Math.min(
    MAX_RESOLUTION_PX,
    Math.max(MIN_RESOLUTION_PX, Math.round(pixels)),
  )
}

/** Restates the same physical size in another unit, so a switch keeps it. */
export function convertResolution(
  resolution: AdvancedResolution,
  unit: ResolutionUnit,
): AdvancedResolution {
  if (unit === resolution.unit) return resolution
  const toUnit = (value: number) =>
    roundForUnit(pixelsToUnit(unitToPixels(value, resolution.unit), unit), unit)
  return {
    width: toUnit(resolution.width),
    height: toUnit(resolution.height),
    unit,
  }
}

/** Exported PNG size in pixels for the advanced resolution the user set. */
export function advancedResolutionToPixels({
  width,
  height,
  unit,
}: AdvancedResolution) {
  return {
    width: clampResolutionPx(unitToPixels(width, unit)),
    height: clampResolutionPx(unitToPixels(height, unit)),
  }
}
export const DEFAULT_LOGO_SIZE = 20
export const MIN_LOGO_SIZE = 10
export const MAX_LOGO_SIZE = 40
export const DEFAULT_QR_MARGIN = 2
export const MIN_QR_MARGIN = 0
export const MAX_QR_MARGIN = 10
export const DEFAULT_LOGO_PADDING = 5
export const MIN_LOGO_PADDING = 0
export const MAX_LOGO_PADDING = 25
export const MAX_RECENT_LOGOS = 8
export const DEFAULT_URL_SCHEME = 'https://'

export const MIN_QR_VERSION = 1
export const MAX_QR_VERSION = 40
export const DEFAULT_MIN_QR_VERSION = MIN_QR_VERSION

export const MIN_CONTOUR_WIDTH = 1
export const MAX_CONTOUR_WIDTH = 16
export const DEFAULT_CONTOUR_WIDTH = 6

export const MIN_PATTERN_SCALE = 60
export const MAX_PATTERN_SCALE = 140
export const DEFAULT_PATTERN_SCALE = 100

/** Modules per side of a QR code of the given version (ISO/IEC 18004). */
export function modulesForVersion(version: number): number {
  return version * 4 + 17
}

/** Inverse of {@link modulesForVersion}. */
export function versionForModules(size: number): number {
  return (size - 17) / 4
}

export function clampQrVersion(version: number): number {
  return Math.min(MAX_QR_VERSION, Math.max(MIN_QR_VERSION, Math.round(version)))
}
