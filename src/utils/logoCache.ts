import { MAX_RECENT_LOGOS } from '../constants'

const DB_NAME = 'qr-logo-cache'
const STORE = 'logos'
const DB_VERSION = 1

export type CachedLogo = {
  id: string
  name: string
  type: string
  size: number
  lastModified: number
  lastUsed: number
  blob: Blob
}

type StoredLogo = {
  id: string
  name: string
  type: string
  size: number
  lastModified: number
  lastUsed: number
  bytes?: Uint8Array
}

export function logoFingerprint(file: {
  name: string
  size: number
  lastModified: number
}): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function toUint8Array(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value
  if (value && typeof value === 'object' && 'length' in value) {
    return Uint8Array.from(value as ArrayLike<number>)
  }
  throw new Error('Invalid stored logo bytes')
}

function readBytes(record: StoredLogo): Uint8Array {
  if (record.bytes == null) {
    throw new Error('Invalid stored logo')
  }
  return toUint8Array(record.bytes)
}

function toCachedLogo(record: StoredLogo, bytes: Uint8Array): CachedLogo {
  const type = record.type || 'image/png'
  return {
    id: record.id,
    name: record.name,
    type,
    size: record.size,
    lastModified: record.lastModified,
    lastUsed: record.lastUsed,
    blob: new Blob([bytes], { type }),
  }
}

function toFile(record: StoredLogo, bytes: Uint8Array): File {
  const type = record.type || 'image/png'
  return new File([bytes], record.name, {
    type,
    lastModified: record.lastModified,
  })
}

export async function listLogos(): Promise<CachedLogo[]> {
  const db = await openDb()
  try {
    const logos = await requestToPromise<StoredLogo[]>(
      db.transaction(STORE, 'readonly').objectStore(STORE).getAll(),
    )
    const restored: CachedLogo[] = []
    for (const record of logos) {
      try {
        restored.push(toCachedLogo(record, readBytes(record)))
      } catch {
        // Skip records that cannot be restored (corrupt or legacy).
      }
    }
    return restored.sort((a, b) => b.lastUsed - a.lastUsed)
  } finally {
    db.close()
  }
}

export async function saveLogo(file: File): Promise<void> {
  const type = file.type || 'image/png'
  const record: StoredLogo = {
    id: logoFingerprint(file),
    name: file.name,
    type,
    size: file.size,
    lastModified: file.lastModified,
    lastUsed: Date.now(),
    bytes: new Uint8Array(await file.arrayBuffer()),
  }

  const db = await openDb()
  try {
    await requestToPromise(
      db.transaction(STORE, 'readwrite').objectStore(STORE).put(record),
    )
    const logos = await requestToPromise<StoredLogo[]>(
      db.transaction(STORE, 'readonly').objectStore(STORE).getAll(),
    )
    if (logos.length <= MAX_RECENT_LOGOS) return

    const extra = logos
      .sort((a, b) => a.lastUsed - b.lastUsed)
      .slice(0, logos.length - MAX_RECENT_LOGOS)
    const store = db.transaction(STORE, 'readwrite').objectStore(STORE)
    await Promise.all(
      extra.map((logo) => requestToPromise(store.delete(logo.id))),
    )
  } finally {
    db.close()
  }
}

export async function getLogo(id: string): Promise<File | null> {
  const db = await openDb()
  try {
    const record = await requestToPromise<StoredLogo | undefined>(
      db.transaction(STORE, 'readonly').objectStore(STORE).get(id),
    )
    if (!record) return null
    try {
      return toFile(record, readBytes(record))
    } catch {
      return null
    }
  } finally {
    db.close()
  }
}
