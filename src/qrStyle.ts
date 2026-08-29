export type QrModuleShape = 'square' | 'rounded' | 'circle'

export type QrStyle = {
  quietZoneColor: string
  dataColor: string
  finder: {
    outerColor: string
    centerColor: string
    outerShape: QrModuleShape
    centerShape: QrModuleShape
  }
  alignment: {
    outerColor: string
    centerColor: string
    shape: QrModuleShape
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
    },
    alignment: {
      outerColor: '#000000',
      centerColor: '#000000',
      shape: 'square',
    },
    timing: {
      color: '#000000',
      shape: 'square',
    },
  }
}

export const DEFAULT_QR_STYLE: QrStyle = createDefaultQrStyle()
