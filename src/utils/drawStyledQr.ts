import type { QrModuleShape, QrStyle } from '../qrStyle'
import { classifyQrModules, type QrModuleKind } from './classifyQrModules'

export type QrBitMatrix = {
  size: number
  get: (row: number, col: number) => number
}

export type DrawStyledQrOptions = {
  resolution: number
  margin: number
  style: QrStyle
}

function appearanceFor(
  kind: QrModuleKind,
  style: QrStyle,
): { color: string; shape: QrModuleShape } | null {
  switch (kind) {
    case 'finderOuter':
      return { color: style.finder.outerColor, shape: style.finder.outerShape }
    case 'finderCenter':
      return {
        color: style.finder.centerColor,
        shape: style.finder.centerShape,
      }
    case 'alignmentOuter':
      return { color: style.alignment.outerColor, shape: style.alignment.shape }
    case 'alignmentCenter':
      return {
        color: style.alignment.centerColor,
        shape: style.alignment.shape,
      }
    case 'timing':
      return { color: style.timing.color, shape: style.timing.shape }
    case 'data':
      return { color: style.dataColor, shape: 'square' }
    default:
      return null
  }
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, r)
  } else {
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + width - r, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + r)
    ctx.lineTo(x + width, y + height - r)
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
    ctx.lineTo(x + r, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }
  ctx.fill()
}

function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  shape: QrModuleShape,
) {
  if (shape === 'square') {
    ctx.fillRect(x, y, width, height)
    return
  }
  if (shape === 'circle') {
    ctx.beginPath()
    ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  fillRoundedRect(ctx, x, y, width, height, Math.min(width, height) * 0.35)
}

export function drawStyledQr(
  ctx: CanvasRenderingContext2D,
  matrix: QrBitMatrix,
  { resolution, margin, style }: DrawStyledQrOptions,
) {
  const { size } = matrix
  const moduleCount = size + margin * 2
  const kinds = classifyQrModules(size)

  ctx.fillStyle = style.quietZoneColor
  ctx.fillRect(0, 0, resolution, resolution)

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!matrix.get(row, col)) continue
      const kind = kinds[row]?.[col]
      if (!kind) continue
      const appearance = appearanceFor(kind, style)
      if (!appearance) continue

      const x0 = ((col + margin) / moduleCount) * resolution
      const y0 = ((row + margin) / moduleCount) * resolution
      const x1 = ((col + margin + 1) / moduleCount) * resolution
      const y1 = ((row + margin + 1) / moduleCount) * resolution

      ctx.fillStyle = appearance.color
      drawModule(ctx, x0, y0, x1 - x0, y1 - y0, appearance.shape)
    }
  }
}
