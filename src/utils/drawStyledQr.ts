import type { QrModuleShape, QrStyle } from '../qrStyle'
import {
  ALIGNMENT_RADIUS,
  ALIGNMENT_SIZE,
  FINDER_SIZE,
  classifyQrModules,
  getAlignmentCenters,
  getFinderOrigins,
  type QrModuleKind,
} from './classifyQrModules'

export type QrBitMatrix = {
  size: number
  get: (row: number, col: number) => number
}

export type DrawStyledQrOptions = {
  resolution: number
  margin: number
  style: QrStyle
}

const GROUPED_KINDS = new Set<QrModuleKind>([
  'finderOuter',
  'finderInner',
  'finderCenter',
  'alignmentOuter',
  'alignmentInner',
  'alignmentCenter',
  'separator',
])

type ModuleBox = { x: number; y: number; w: number; h: number }

function moduleBox(
  row: number,
  col: number,
  modules: number,
  margin: number,
  moduleCount: number,
  resolution: number,
): ModuleBox {
  const x0 = ((col + margin) / moduleCount) * resolution
  const y0 = ((row + margin) / moduleCount) * resolution
  const x1 = ((col + margin + modules) / moduleCount) * resolution
  const y1 = ((row + margin + modules) / moduleCount) * resolution
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
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

function fillShape(
  ctx: CanvasRenderingContext2D,
  box: ModuleBox,
  shape: QrModuleShape,
) {
  if (shape === 'square') {
    ctx.fillRect(box.x, box.y, box.w, box.h)
    return
  }
  if (shape === 'circle') {
    ctx.beginPath()
    ctx.arc(
      box.x + box.w / 2,
      box.y + box.h / 2,
      Math.min(box.w, box.h) / 2,
      0,
      Math.PI * 2,
    )
    ctx.fill()
    return
  }
  if (shape === 'triangle') {
    ctx.beginPath()
    ctx.moveTo(box.x + box.w / 2, box.y)
    ctx.lineTo(box.x + box.w, box.y + box.h)
    ctx.lineTo(box.x, box.y + box.h)
    ctx.closePath()
    ctx.fill()
    return
  }
  fillRoundedRect(
    ctx,
    box.x,
    box.y,
    box.w,
    box.h,
    Math.min(box.w, box.h) * 0.22,
  )
}

function drawPatternGroup(
  ctx: CanvasRenderingContext2D,
  originRow: number,
  originCol: number,
  sizeModules: number,
  outerShape: QrModuleShape,
  centerShape: QrModuleShape,
  outerColor: string,
  centerColor: string,
  quietZoneColor: string,
  margin: number,
  moduleCount: number,
  resolution: number,
) {
  const pupilModules = sizeModules === FINDER_SIZE ? 3 : 1
  const pupilInset = (sizeModules - pupilModules) / 2
  const outer = moduleBox(
    originRow,
    originCol,
    sizeModules,
    margin,
    moduleCount,
    resolution,
  )
  const hole = moduleBox(
    originRow + 1,
    originCol + 1,
    sizeModules - 2,
    margin,
    moduleCount,
    resolution,
  )
  const pupil = moduleBox(
    originRow + pupilInset,
    originCol + pupilInset,
    pupilModules,
    margin,
    moduleCount,
    resolution,
  )

  ctx.fillStyle = outerColor
  fillShape(ctx, outer, outerShape)
  ctx.fillStyle = quietZoneColor
  fillShape(ctx, hole, outerShape)
  ctx.fillStyle = centerColor
  fillShape(ctx, pupil, centerShape)
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
      if (!kind || GROUPED_KINDS.has(kind)) continue

      const x0 = ((col + margin) / moduleCount) * resolution
      const y0 = ((row + margin) / moduleCount) * resolution
      const x1 = ((col + margin + 1) / moduleCount) * resolution
      const y1 = ((row + margin + 1) / moduleCount) * resolution
      const box = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }

      if (kind === 'timing') {
        ctx.fillStyle = style.timing.color
        fillShape(ctx, box, style.timing.shape)
        continue
      }

      ctx.fillStyle = style.dataColor
      fillShape(ctx, box, 'square')
    }
  }

  for (const [originRow, originCol] of getFinderOrigins(size)) {
    drawPatternGroup(
      ctx,
      originRow,
      originCol,
      FINDER_SIZE,
      style.finder.outerShape,
      style.finder.centerShape,
      style.finder.outerColor,
      style.finder.centerColor,
      style.quietZoneColor,
      margin,
      moduleCount,
      resolution,
    )
  }

  for (const [centerRow, centerCol] of getAlignmentCenters(size)) {
    drawPatternGroup(
      ctx,
      centerRow - ALIGNMENT_RADIUS,
      centerCol - ALIGNMENT_RADIUS,
      ALIGNMENT_SIZE,
      style.alignment.shape,
      style.alignment.shape,
      style.alignment.outerColor,
      style.alignment.centerColor,
      style.quietZoneColor,
      margin,
      moduleCount,
      resolution,
    )
  }
}
