import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { afterEach, beforeEach } from 'vitest'

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
})

afterEach(() => {
  cleanup()
})

const objectUrls = new Map<string, Blob>()
let objectUrlCount = 0

URL.createObjectURL = (blob: Blob) => {
  objectUrlCount += 1
  const url = `blob:mock-${objectUrlCount}`
  objectUrls.set(url, blob)
  return url
}

URL.revokeObjectURL = (url: string) => {
  objectUrls.delete(url)
}

HTMLCanvasElement.prototype.getContext = function getContext(
  this: HTMLCanvasElement,
  contextId: string,
) {
  if (contextId !== '2d') return null
  const width = this.width || 1
  const height = this.height || 1
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255
    data[i + 1] = 255
    data[i + 2] = 255
    data[i + 3] = 255
  }
  return {
    fillStyle: '#ffffff',
    fillRect() {},
    drawImage() {},
    save() {},
    restore() {},
    clip() {},
    rect() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    arc() {},
    quadraticCurveTo() {},
    roundRect() {},
    fill() {},
    getImageData() {
      return { data, width, height }
    },
  } as unknown as CanvasRenderingContext2D
} as HTMLCanvasElement['getContext']

class MockImage {
  onload: ((this: MockImage, event: Event) => void) | null = null
  onerror: ((this: MockImage, event: Event) => void) | null = null
  width = 64
  height = 64
  set src(value: string) {
    queueMicrotask(() => {
      if (value.includes('error')) {
        this.onerror?.call(this, new Event('error'))
        return
      }
      this.onload?.call(this, new Event('load'))
    })
  }
}

Object.defineProperty(window, 'Image', { writable: true, value: MockImage })

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query.includes('dark'),
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }),
})
