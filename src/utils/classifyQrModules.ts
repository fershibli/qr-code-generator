export type QrModuleKind =
  | 'finderOuter'
  | 'finderInner'
  | 'finderCenter'
  | 'alignmentOuter'
  | 'alignmentInner'
  | 'alignmentCenter'
  | 'timing'
  | 'separator'
  | 'data'

export const FINDER_SIZE = 7
export const ALIGNMENT_RADIUS = 2
export const ALIGNMENT_SIZE = ALIGNMENT_RADIUS * 2 + 1

function versionFromSize(size: number): number {
  return (size - 17) / 4
}

function finderOrigins(size: number): Array<[number, number]> {
  return [
    [0, 0],
    [size - FINDER_SIZE, 0],
    [0, size - FINDER_SIZE],
  ]
}

export function getFinderOrigins(size: number): Array<[number, number]> {
  return finderOrigins(size)
}

export function getAlignmentCenters(size: number): Array<[number, number]> {
  return alignmentCenters(versionFromSize(size), size)
}

function alignmentCenters(version: number, size: number): Array<[number, number]> {
  if (version === 1) return []

  const posCount = Math.floor(version / 7) + 2
  const intervals =
    size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2
  const positions = [size - 7]
  for (let i = 1; i < posCount - 1; i += 1) {
    positions[i] = positions[i - 1] - intervals
  }
  positions.push(6)
  const coords = positions.reverse()
  const centers: Array<[number, number]> = []

  for (let i = 0; i < coords.length; i += 1) {
    for (let j = 0; j < coords.length; j += 1) {
      if (
        (i === 0 && j === 0) ||
        (i === 0 && j === coords.length - 1) ||
        (i === coords.length - 1 && j === 0)
      ) {
        continue
      }
      const row = coords[i]
      const col = coords[j]
      if (row === undefined || col === undefined) continue
      centers.push([row, col])
    }
  }

  return centers
}

function finderKind(
  row: number,
  col: number,
  originRow: number,
  originCol: number,
): QrModuleKind | null {
  const r = row - originRow
  const c = col - originCol
  if (r < 0 || r > 6 || c < 0 || c > 6) return null
  if (r === 0 || r === 6 || c === 0 || c === 6) return 'finderOuter'
  if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return 'finderCenter'
  return 'finderInner'
}

function isSeparator(row: number, col: number, size: number): boolean {
  for (const [originRow, originCol] of finderOrigins(size)) {
    const r = row - originRow
    const c = col - originCol
    if (r < -1 || r > 7 || c < -1 || c > 7) continue
    if (r >= 0 && r <= 6 && c >= 0 && c <= 6) continue
    return true
  }
  return false
}

function alignmentKind(
  row: number,
  col: number,
  centers: Array<[number, number]>,
): QrModuleKind | null {
  for (const [centerRow, centerCol] of centers) {
    const r = row - centerRow
    const c = col - centerCol
    if (Math.abs(r) > ALIGNMENT_RADIUS || Math.abs(c) > ALIGNMENT_RADIUS) {
      continue
    }
    if (r === 0 && c === 0) return 'alignmentCenter'
    if (
      r === -ALIGNMENT_RADIUS ||
      r === ALIGNMENT_RADIUS ||
      c === -ALIGNMENT_RADIUS ||
      c === ALIGNMENT_RADIUS
    ) {
      return 'alignmentOuter'
    }
    return 'alignmentInner'
  }
  return null
}

function isTiming(row: number, col: number, size: number): boolean {
  return (
    (row === 6 && col >= 8 && col < size - 8) ||
    (col === 6 && row >= 8 && row < size - 8)
  )
}

export function classifyQrModules(size: number): QrModuleKind[][] {
  const version = versionFromSize(size)
  const centers = alignmentCenters(version, size)
  const grid: QrModuleKind[][] = []

  for (let row = 0; row < size; row += 1) {
    const line: QrModuleKind[] = []
    for (let col = 0; col < size; col += 1) {
      let kind: QrModuleKind | null = null
      for (const [originRow, originCol] of finderOrigins(size)) {
        kind = finderKind(row, col, originRow, originCol)
        if (kind) break
      }
      if (!kind && isSeparator(row, col, size)) kind = 'separator'
      if (!kind) kind = alignmentKind(row, col, centers)
      if (!kind && isTiming(row, col, size)) kind = 'timing'
      line.push(kind ?? 'data')
    }
    grid.push(line)
  }

  return grid
}
