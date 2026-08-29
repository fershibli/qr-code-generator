import { DEFAULT_CONTOUR_WIDTH, DEFAULT_PATTERN_SCALE } from './constants'

export type QrModuleShape = 'square' | 'rounded' | 'circle' | 'triangle'

/** Outline the decorative fill around the code is clipped to. */
export type QrContourShape = 'circle' | 'square' | 'rounded' | 'diamond'

export type QrStyle = {
  quietZoneColor: string
  dataColor: string
  finder: {
    outerColor: string
    centerColor: string
    outerShape: QrModuleShape
    centerShape: QrModuleShape
    /** Drawn size of the whole mark, as a percentage of its 7x7 module box. */
    scale: number
  }
  alignment: {
    outerColor: string
    centerColor: string
    shape: QrModuleShape
    /** Drawn size of the whole mark, as a percentage of its 5x5 module box. */
    scale: number
  }
  timing: {
    color: string
    shape: QrModuleShape
  }
  contour: {
    enabled: boolean
    shape: QrContourShape
    color: string
    moduleShape: QrModuleShape
    /** Width of the decorated band around the code, in modules. */
    width: number
  }
}

export function createDefaultQrStyle(): QrStyle {
  return {
    quietZoneColor: '#ffffff',
    dataColor: '#000000',
    finder: {
      outerColor: '#000000',
      centerColor: '#000000',
      outerShape: 'square',
      centerShape: 'square',
      scale: DEFAULT_PATTERN_SCALE,
    },
    alignment: {
      outerColor: '#000000',
      centerColor: '#000000',
      shape: 'square',
      scale: DEFAULT_PATTERN_SCALE,
    },
    timing: {
      color: '#000000',
      shape: 'square',
    },
    contour: {
      enabled: false,
      shape: 'circle',
      color: '#000000',
      moduleShape: 'square',
      width: DEFAULT_CONTOUR_WIDTH,
    },
  }
}

export const DEFAULT_QR_STYLE: QrStyle = createDefaultQrStyle()
