import { describe, expect, it, vi } from 'vitest'
import { canvasToRgbPngBlob } from './encodeRgbPng'

describe('canvasToRgbPngBlob', () => {
  it('encodes an RGB PNG without an alpha channel', async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 2
    const blob = await canvasToRgbPngBlob(canvas)
    expect(blob.type).toBe('image/png')
    const bytes = new Uint8Array(await blob.arrayBuffer())
    expect(Array.from(bytes.slice(0, 8))).toEqual([
      137, 80, 78, 71, 13, 10, 26, 10,
    ])
    expect(bytes[24]).toBe(8)
    expect(bytes[25]).toBe(2)
  })

  it('throws when the canvas has no 2d context', async () => {
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue(null)
    await expect(canvasToRgbPngBlob(canvas)).rejects.toThrow(
      'Could not get canvas context',
    )
  })
})
