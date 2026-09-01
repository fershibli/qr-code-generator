import type { QrContourShape, QrModuleShape, QrStyle } from '../qrStyle'
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

/** Square the code itself occupies on the canvas, in pixels. */
export type QrCoreBox = {
  origin: number
  size: number
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

/**
 * Placement of the module lattice on the canvas: the code plus its quiet zone
 * fills a `size` square starting at `origin`, and the contour fill reuses the
 * same lattice outside it.
 */
type ModuleGrid = {
  origin: number
  size: number
  margin: number
  moduleCount: number
}

function moduleBox(
  grid: ModuleGrid,
  row: number,
  col: number,
  modules = 1,
): ModuleBox {
  const step = grid.size / grid.moduleCount
  const x = grid.origin + (col + grid.margin) * step
  const y = grid.origin + (row + grid.margin) * step
  return { x, y, w: step * modules, h: step * modules }
}

/** Grows or shrinks a box around a fixed center point. */
function scaleBox(
  box: ModuleBox,
  centerX: number,
  centerY: number,
  scale: number,
): ModuleBox {
  if (scale === 1) return box
  return {
    x: centerX + (box.x - centerX) * scale,
    y: centerY + (box.y - centerY) * scale,
    w: box.w * scale,
    h: box.h * scale,
  }
}

function traceRoundedRect(
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
    return
  }
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
  traceRoundedRect(
    ctx,
    box.x,
    box.y,
    box.w,
    box.h,
    Math.min(box.w, box.h) * 0.22,
  )
  ctx.fill()
}

type PatternGroupOptions = {
  originRow: number
  originCol: number
  sizeModules: number
  outerShape: QrModuleShape
  centerShape: QrModuleShape
  outerColor: string
  centerColor: string
  quietZoneColor: string
  /** Drawn size of the mark, as a percentage of its module box. */
  scalePercent: number
}

function drawPatternGroup(
  ctx: CanvasRenderingContext2D,
  grid: ModuleGrid,
  {
    originRow,
    originCol,
    sizeModules,
    outerShape,
    centerShape,
    outerColor,
    centerColor,
    quietZoneColor,
    scalePercent,
  }: PatternGroupOptions,
) {
  const pupilModules = sizeModules === FINDER_SIZE ? 3 : 1
  const pupilInset = (sizeModules - pupilModules) / 2
  const outer = moduleBox(grid, originRow, originCol, sizeModules)
  const hole = moduleBox(grid, originRow + 1, originCol + 1, sizeModules - 2)
  const pupil = moduleBox(
    grid,
    originRow + pupilInset,
    originCol + pupilInset,
    pupilModules,
  )

  const scale = scalePercent / 100
  const centerX = outer.x + outer.w / 2
  const centerY = outer.y + outer.h / 2

  ctx.fillStyle = outerColor
  fillShape(ctx, scaleBox(outer, centerX, centerY, scale), outerShape)
  ctx.fillStyle = quietZoneColor
  fillShape(ctx, scaleBox(hole, centerX, centerY, scale), outerShape)
  ctx.fillStyle = centerColor
  fillShape(ctx, scaleBox(pupil, centerX, centerY, scale), centerShape)
}

function clipToContour(
  ctx: CanvasRenderingContext2D,
  shape: QrContourShape,
  resolution: number,
) {
  const half = resolution / 2
  if (shape === 'circle') {
    ctx.beginPath()
    ctx.arc(half, half, half, 0, Math.PI * 2)
  } else if (shape === 'diamond') {
    ctx.beginPath()
    ctx.moveTo(half, 0)
    ctx.lineTo(resolution, half)
    ctx.lineTo(half, resolution)
    ctx.lineTo(0, half)
    ctx.closePath()
  } else if (shape === 'rounded') {
    traceRoundedRect(ctx, 0, 0, resolution, resolution, resolution * 0.2)
  } else {
    ctx.beginPath()
    ctx.rect(0, 0, resolution, resolution)
  }
  ctx.clip()
}

/**
 * Fills the band around the code with copies of its own data modules, tiled on
 * the same lattice and clipped to the contour shape. Function patterns are left
 * out on purpose: only "pixels" repeat, so no second set of finders competes
 * with the real ones. The gap between the code and the fill is the QR margin,
 * so setting that to zero makes the fill start right at the code.
 */
function drawContourFill(
  ctx: CanvasRenderingContext2D,
  matrix: QrBitMatrix,
  kinds: QrModuleKind[][],
  grid: ModuleGrid,
  style: QrStyle,
  resolution: number,
) {
  const { size } = matrix
  const first = -grid.margin - style.contour.width
  const last = size - 1 + grid.margin + style.contour.width

  ctx.save()
  clipToContour(ctx, style.contour.shape, resolution)
  ctx.fillStyle = style.contour.color

  for (let row = first; row <= last; row += 1) {
    const rowInsideCode = row >= -grid.margin && row < size + grid.margin
    for (let col = first; col <= last; col += 1) {
      if (rowInsideCode && col >= -grid.margin && col < size + grid.margin) {
        continue
      }
      const sourceRow = ((row % size) + size) % size
      const sourceCol = ((col % size) + size) % size
      if (kinds[sourceRow]?.[sourceCol] !== 'data') continue
      if (!matrix.get(sourceRow, sourceCol)) continue
      fillShape(ctx, moduleBox(grid, row, col), style.contour.moduleShape)
    }
  }

  ctx.restore()
}

export function drawStyledQr(
  ctx: CanvasRenderingContext2D,
  matrix: QrBitMatrix,
  { resolution, margin, style }: DrawStyledQrOptions,
): QrCoreBox {
  const { size } = matrix
  const kinds = classifyQrModules(size)
  const contourWidth = style.contour.enabled ? style.contour.width : 0
  const step = resolution / (size + (margin + contourWidth) * 2)
  const grid: ModuleGrid = {
    origin: contourWidth * step,
    size: (size + margin * 2) * step,
    margin,
    moduleCount: size + margin * 2,
  }

  ctx.fillStyle = style.quietZoneColor
  ctx.fillRect(0, 0, resolution, resolution)

  if (style.contour.enabled) {
    drawContourFill(ctx, matrix, kinds, grid, style, resolution)
  }

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!matrix.get(row, col)) continue
      const kind = kinds[row]?.[col]
      if (!kind || GROUPED_KINDS.has(kind)) continue

      const box = moduleBox(grid, row, col)

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
    drawPatternGroup(ctx, grid, {
      originRow,
      originCol,
      sizeModules: FINDER_SIZE,
      outerShape: style.finder.outerShape,
      centerShape: style.finder.centerShape,
      outerColor: style.finder.outerColor,
      centerColor: style.finder.centerColor,
      quietZoneColor: style.quietZoneColor,
      scalePercent: style.finder.scale,
    })
  }

  for (const [centerRow, centerCol] of getAlignmentCenters(size)) {
    drawPatternGroup(ctx, grid, {
      originRow: centerRow - ALIGNMENT_RADIUS,
      originCol: centerCol - ALIGNMENT_RADIUS,
      sizeModules: ALIGNMENT_SIZE,
      outerShape: style.alignment.shape,
      centerShape: style.alignment.shape,
      outerColor: style.alignment.outerColor,
      centerColor: style.alignment.centerColor,
      quietZoneColor: style.quietZoneColor,
      scalePercent: style.alignment.scale,
    })
  }

  return { origin: grid.origin, size: grid.size }
}
