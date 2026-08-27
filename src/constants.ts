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
