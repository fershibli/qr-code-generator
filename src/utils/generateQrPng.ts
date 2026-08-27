import QRCode from 'qrcode'
import { canvasToRgbPngBlob } from './encodeRgbPng'

export type GenerateQrPngOptions = {
  url: string
  logoFile?: File | null
  size: number
  resolution: number
  margin: number
}

export type GenerateQrPngResult = {
  blob: Blob
  objectUrl: string
  width: number
  height: number
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
  sizePercent: number,
) {
  const logoPx = resolution * (sizePercent / 100)
  const pad = logoPx * 0.05
  const boxSize = logoPx + pad * 2
  const boxX = (resolution - boxSize) / 2
  const boxY = (resolution - boxSize) / 2

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(boxX, boxY, boxSize, boxSize)

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
}: GenerateQrPngOptions): Promise<GenerateQrPngResult> {
  const qrCanvas = document.createElement('canvas')
  await QRCode.toCanvas(qrCanvas, url, {
    width: resolution,
    margin,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })

  const canvas = document.createElement('canvas')
  canvas.width = resolution
  canvas.height = resolution
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, resolution, resolution)
  ctx.drawImage(qrCanvas, 0, 0, resolution, resolution)

  if (logoFile) {
    const logo = await loadImage(logoFile)
    drawCenteredLogo(ctx, logo, resolution, size)
  }

  const blob = await canvasToRgbPngBlob(canvas)
  return {
    blob,
    objectUrl: URL.createObjectURL(blob),
    width: resolution,
    height: resolution,
  }
}
