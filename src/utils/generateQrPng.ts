import QRCode from 'qrcode'
import {
  DEFAULT_MIN_QR_VERSION,
  clampQrVersion,
  modulesForVersion,
  versionForModules,
} from '../constants'
import { DEFAULT_QR_STYLE, type QrStyle } from '../qrStyle'
import { canvasToRgbPngBlob } from './encodeRgbPng'
import { drawStyledQr } from './drawStyledQr'

export type GenerateQrPngOptions = {
  url: string
  logoFile?: File | null
  size: number
  resolution: number
  margin: number
  logoPadding: number
  style?: QrStyle
  logoTransparentBackground?: boolean
  /** Lowest QR version to encode with; higher versions pack more modules. */
  minVersion?: number
}

export type GenerateQrPngResult = {
  blob: Blob
  objectUrl: string
  width: number
  height: number
  version: number
  moduleCount: number
}

/**
 * Encodes `url` at the smallest version that fits it, then re-encodes at
 * `minVersion` when the user asked for a denser (more pixelated) code. The
 * automatic version always wins when the payload needs more room, so a long
 * URL never fails because of this setting.
 */
function createMatrix(url: string, minVersion: number) {
  const automatic = QRCode.create(url, { errorCorrectionLevel: 'H' })
  const version = clampQrVersion(minVersion)
  if (automatic.modules.size >= modulesForVersion(version)) return automatic
  return QRCode.create(url, { errorCorrectionLevel: 'H', version })
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load logo image'))
    }
    image.src = objectUrl
  })
}

function drawCenteredLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  resolution: number,
  qrSize: number,
  sizePercent: number,
  logoPadding: number,
  backingColor: string,
  transparentBackground: boolean,
) {
  const logoPx = qrSize * (sizePercent / 100)
  const pad = logoPx * (logoPadding / 100)
  const boxSize = logoPx + pad * 2
  const boxX = (resolution - boxSize) / 2
  const boxY = (resolution - boxSize) / 2

  if (!transparentBackground) {
    ctx.fillStyle = backingColor
    ctx.fillRect(boxX, boxY, boxSize, boxSize)
  }

  const scale = Math.min(logoPx / logo.width, logoPx / logo.height)
  const drawWidth = logo.width * scale
  const drawHeight = logo.height * scale
  const drawX = (resolution - drawWidth) / 2
  const drawY = (resolution - drawHeight) / 2

  ctx.drawImage(logo, drawX, drawY, drawWidth, drawHeight)
}

export async function generateQrPng({
  url,
  logoFile,
  size,
  resolution,
  margin,
  logoPadding,
  style = DEFAULT_QR_STYLE,
  logoTransparentBackground = false,
  minVersion = DEFAULT_MIN_QR_VERSION,
}: GenerateQrPngOptions): Promise<GenerateQrPngResult> {
  const qr = createMatrix(url, minVersion)

  const canvas = document.createElement('canvas')
  canvas.width = resolution
  canvas.height = resolution
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  const core = drawStyledQr(ctx, qr.modules, { resolution, margin, style })

  if (logoFile) {
    const logo = await loadImage(logoFile)
    drawCenteredLogo(
      ctx,
      logo,
      resolution,
      core.size,
      size,
      logoPadding,
      style.quietZoneColor,
      logoTransparentBackground,
    )
  }

  const blob = await canvasToRgbPngBlob(canvas)
  return {
    blob,
    objectUrl: URL.createObjectURL(blob),
    width: resolution,
    height: resolution,
    version: versionForModules(qr.modules.size),
    moduleCount: qr.modules.size,
  }
}
