import { DEFAULT_PATTERN_SCALE } from './constants'

export type QrModuleShape = 'square' | 'rounded' | 'circle' | 'triangle'

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
  }
}

export const DEFAULT_QR_STYLE: QrStyle = createDefaultQrStyle()
