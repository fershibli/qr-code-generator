import { zlibSync } from 'fflate'

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function u32(value: number): Uint8Array<ArrayBuffer> {
  return new Uint8Array([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ])
}

function pngChunk(type: string, data: Uint8Array): Uint8Array<ArrayBuffer> {
  const typeBytes = new TextEncoder().encode(type)
  const crcInput = new Uint8Array(typeBytes.length + data.length)
  crcInput.set(typeBytes, 0)
  crcInput.set(data, typeBytes.length)

  const chunk = new Uint8Array(4 + 4 + data.length + 4)
  chunk.set(u32(data.length), 0)
  chunk.set(typeBytes, 4)
  chunk.set(data, 8)
  chunk.set(u32(crc32(crcInput)), 8 + data.length)
  return chunk
}

function zlibCompress(data: Uint8Array): Uint8Array<ArrayBuffer> {
  return new Uint8Array(zlibSync(data, { level: 6 }))
}

export async function canvasToRgbPngBlob(
  canvas: HTMLCanvasElement,
): Promise<Blob> {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  const { width, height } = canvas
  const rgba = ctx.getImageData(0, 0, width, height).data
  const scanlines = new Uint8Array(height * (1 + width * 3))

  let offset = 0
  for (let y = 0; y < height; y += 1) {
    scanlines[offset] = 0
    offset += 1
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4
      scanlines[offset] = rgba[i]
      scanlines[offset + 1] = rgba[i + 1]
      scanlines[offset + 2] = rgba[i + 2]
      offset += 3
    }
  }

  const ihdr = new Uint8Array(13)
  const view = new DataView(ihdr.buffer)
  view.setUint32(0, width)
  view.setUint32(4, height)
  ihdr[8] = 8
  ihdr[9] = 2
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const idat = zlibCompress(scanlines)
  return new Blob(
    [
      PNG_SIGNATURE,
      pngChunk('IHDR', ihdr),
      pngChunk('IDAT', idat),
      pngChunk('IEND', new Uint8Array()),
    ],
    { type: 'image/png' },
  )
}
