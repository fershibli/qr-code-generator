import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MAX_RECENT_LOGOS } from '../constants'
import { getLogo, listLogos, logoFingerprint, saveLogo } from './logoCache'

function makeFile(name: string, lastModified = Date.now()) {
  return new File([new Uint8Array([1, 2, 3, 4])], name, {
    type: 'image/png',
    lastModified,
  })
}

async function putStored(record: Record<string, unknown>) {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('qr-logo-cache', 1)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains('logos')) {
        database.createObjectStore('logos', { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  try {
    await new Promise<void>((resolve, reject) => {
      const request = db
        .transaction('logos', 'readwrite')
        .objectStore('logos')
        .put(record)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

describe('logoCache', () => {
  beforeEach(() => {
    let now = 1_000_000
    vi.spyOn(Date, 'now').mockImplementation(() => {
      now += 1
      return now
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('builds a fingerprint from name, size, and lastModified', () => {
    const file = makeFile('logo.png', 42)
    expect(logoFingerprint(file)).toBe(`logo.png:${file.size}:42`)
  })

  it('saves and lists logos newest first', async () => {
    const older = makeFile('a.png', 1)
    const newer = makeFile('b.png', 2)
    await saveLogo(older)
    await saveLogo(newer)
    const logos = await listLogos()
    expect(logos.map((logo) => logo.name)).toEqual(['b.png', 'a.png'])
  })

  it('bumps lastUsed when the same file is saved again', async () => {
    const file = makeFile('same.png', 10)
    await saveLogo(file)
    const other = makeFile('other.png', 11)
    await saveLogo(other)
    await saveLogo(file)
    const logos = await listLogos()
    expect(logos[0]?.name).toBe('same.png')
    expect(logos).toHaveLength(2)
  })

  it('prunes the oldest logos beyond the max', async () => {
    for (let i = 0; i < MAX_RECENT_LOGOS + 1; i += 1) {
      await saveLogo(makeFile(`logo-${i}.png`, i + 1))
    }
    const logos = await listLogos()
    expect(logos).toHaveLength(MAX_RECENT_LOGOS)
    expect(logos.some((logo) => logo.name === 'logo-0.png')).toBe(false)
  })

  it('reconstructs a File from a cached logo', async () => {
    const file = makeFile('cached.png', 99)
    await saveLogo(file)
    const restored = await getLogo(logoFingerprint(file))
    expect(restored).toBeInstanceOf(File)
    expect(restored?.name).toBe('cached.png')
    expect(restored?.type).toBe('image/png')
    expect(restored?.lastModified).toBe(99)
    expect(restored?.size).toBe(file.size)
  })

  it('returns null for a missing logo id', async () => {
    expect(await getLogo('missing')).toBeNull()
  })

  it('defaults missing file type to image/png', async () => {
    const file = new File([new Uint8Array([1])], 'no-type.bin', {
      type: '',
      lastModified: 1,
    })
    await saveLogo(file)
    const restored = await getLogo(logoFingerprint(file))
    expect(restored?.type).toBe('image/png')
  })

  it('skips unreadable stored logos and returns null for them', async () => {
    await putStored({
      id: 'empty:1:1',
      name: 'empty.png',
      type: 'image/png',
      size: 1,
      lastModified: 1,
      lastUsed: 1,
    })
    await putStored({
      id: 'bad:1:1',
      name: 'bad.png',
      type: 'image/png',
      size: 1,
      lastModified: 1,
      lastUsed: 2,
      bytes: 'nope',
    })
    await putStored({
      id: 'list:4:3',
      name: 'list.png',
      type: 'image/png',
      size: 4,
      lastModified: 3,
      lastUsed: 3,
      bytes: { 0: 9, 1: 8, 2: 7, 3: 6, length: 4 },
    })
    expect(await getLogo('empty:1:1')).toBeNull()
    expect(await getLogo('bad:1:1')).toBeNull()
    const restored = await getLogo('list:4:3')
    expect(restored?.name).toBe('list.png')
    expect(restored?.size).toBe(4)
    expect((await listLogos()).map((logo) => logo.name)).toEqual(['list.png'])
  })
})
