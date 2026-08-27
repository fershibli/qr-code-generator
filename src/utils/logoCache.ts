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

export async function listLogos(): Promise<CachedLogo[]> {
  const db = await openDb()
  try {
    const logos = await requestToPromise(
      db.transaction(STORE, 'readonly').objectStore(STORE).getAll(),
    )
    return logos.sort((a, b) => b.lastUsed - a.lastUsed)
  } finally {
    db.close()
  }
}

export async function saveLogo(file: File): Promise<void> {
  const record: CachedLogo = {
    id: logoFingerprint(file),
    name: file.name,
    type: file.type || 'image/png',
    size: file.size,
    lastModified: file.lastModified,
    lastUsed: Date.now(),
    blob: file,
  }

  const db = await openDb()
  try {
    await requestToPromise(
      db.transaction(STORE, 'readwrite').objectStore(STORE).put(record),
    )
    const logos = await requestToPromise(
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
    const record = await requestToPromise(
      db.transaction(STORE, 'readonly').objectStore(STORE).get(id),
    )
    if (!record) return null
    return new File([record.blob], record.name, {
      type: record.type,
      lastModified: record.lastModified,
    })
  } finally {
    db.close()
  }
}
