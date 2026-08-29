export const RESOLUTIONS = [250, 500, 750, 1000, 1250, 1500, 1750] as const

export type Resolution = (typeof RESOLUTIONS)[number]

export const PREVIEW_SIZE = 500
export const DEFAULT_RESOLUTION: Resolution = 500
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

export const MIN_QR_VERSION = 1
export const MAX_QR_VERSION = 40
export const DEFAULT_MIN_QR_VERSION = MIN_QR_VERSION

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
