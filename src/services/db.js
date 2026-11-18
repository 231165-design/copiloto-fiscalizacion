import { openDB } from 'idb'

const DB_NAME    = 'fiscalizacion-db'
const DB_VERSION = 1

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Historial de consultas
      if (!db.objectStoreNames.contains('history')) {
        const store = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true })
        store.createIndex('plate', 'plate', { unique: false })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
      // Cola offline
      if (!db.objectStoreNames.contains('offlineQueue')) {
        db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

// ── Historial ───────────────────────────────────────────

export async function saveToHistory(entry) {
  const db = await getDB()
  return db.add('history', { ...entry, timestamp: Date.now() })
}

export async function getHistory() {
  const db = await getDB()
  const all = await db.getAll('history')
  return all.sort((a, b) => b.timestamp - a.timestamp)
}

export async function clearHistory() {
  const db = await getDB()
  return db.clear('history')
}

// ── Cola offline ─────────────────────────────────────────

export async function enqueueOffline(plate) {
  const db = await getDB()
  return db.add('offlineQueue', { plate, queuedAt: Date.now() })
}

export async function getOfflineQueue() {
  const db = await getDB()
  return db.getAll('offlineQueue')
}

export async function removeFromQueue(id) {
  const db = await getDB()
  return db.delete('offlineQueue', id)
}
