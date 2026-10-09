import { Book } from "@/app/schemas/book_schema";

const DB_NAME = "novel_next_db";
const DB_VERSION = 1;
const BOOKS_STORE = "books";
const SYNC_QUEUE_STORE = "sync_queue";

export interface SyncQueueItem {
  id: string;
  action: "save" | "delete";
  book?: Book;
  timestamp: number;
}

let dbInstance: IDBDatabase | null = null;
let isIndexedDBAvailable: boolean | null = null;

// Memoria di fallback se IndexedDB non è disponibile
const memoryCache = {
  books: new Map<string, Book>(),
  syncQueue: new Map<string, SyncQueueItem>(),
};

/**
 * Verifica se IndexedDB è utilizzabile nel contesto corrente
 */
function checkIndexedDBSupport(): boolean {
  if (isIndexedDBAvailable !== null) return isIndexedDBAvailable;
  if (typeof window === "undefined" || !window.indexedDB) {
    isIndexedDBAvailable = false;
    return false;
  }
  isIndexedDBAvailable = true;
  return true;
}

/**
 * Apre la connessione al database IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (!checkIndexedDBSupport()) {
      return reject(new Error("IndexedDB non supportato"));
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(BOOKS_STORE)) {
          db.createObjectStore(BOOKS_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        dbInstance.onclose = () => {
          dbInstance = null;
        };
        resolve(dbInstance);
      };

      request.onerror = () => {
        console.warn("Impossibile aprire IndexedDB, fallback su storage locale:", request.error);
        reject(request.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Esegue una transazione generica su IndexedDB
 */
async function performTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);

      let req: IDBRequest<T> | void;
      try {
        req = operation(store);
      } catch (e) {
        return reject(e);
      }

      tx.oncomplete = () => {
        if (req && "result" in req) {
          resolve(req.result);
        } else {
          resolve();
        }
      };

      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error("Transazione abortita"));
    });
  } catch (error) {
    // Fallback in memoria
    return undefined;
  }
}

// ==================== GESTIONE LIBRI OFFLINE ====================

/**
 * Salva un libro nella cache locale (IndexedDB + fallback)
 */
export async function saveBookLocally(book: Book): Promise<void> {
  if (!book?.id) return;
  memoryCache.books.set(book.id, book);

  if (checkIndexedDBSupport()) {
    try {
      await performTransaction(BOOKS_STORE, "readwrite", (store) => {
        store.put(book);
      });
      return;
    } catch (e) {
      console.warn("Errore salvataggio libro su IndexedDB:", e);
    }
  }

  // Fallback localStorage per il libro
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`offline_book_${book.id}`, JSON.stringify(book));
    } catch {
      // Quota superata o storage bloccato
    }
  }
}

/**
 * Salva una lista di libri nella cache locale
 */
export async function saveAllBooksLocally(books: Book[]): Promise<void> {
  for (const book of books) {
    if (book?.id) {
      memoryCache.books.set(book.id, book);
    }
  }

  if (checkIndexedDBSupport()) {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(BOOKS_STORE, "readwrite");
        const store = tx.objectStore(BOOKS_STORE);
        for (const book of books) {
          if (book?.id) store.put(book);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      return;
    } catch (e) {
      console.warn("Errore salvataggio libri bulk su IndexedDB:", e);
    }
  }
}

/**
 * Recupera un libro dalla cache locale
 */
export async function getBookLocally(id: string): Promise<Book | null> {
  if (memoryCache.books.has(id)) {
    return memoryCache.books.get(id) || null;
  }

  if (checkIndexedDBSupport()) {
    try {
      const result = await performTransaction<Book>(BOOKS_STORE, "readonly", (store) => {
        return store.get(id);
      });
      if (result) {
        memoryCache.books.set(id, result);
        return result;
      }
    } catch (e) {
      console.warn("Errore lettura libro da IndexedDB:", e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(`offline_book_${id}`);
      if (item) {
        const parsed = JSON.parse(item) as Book;
        memoryCache.books.set(id, parsed);
        return parsed;
      }
    } catch {}
  }

  return null;
}

/**
 * Recupera tutti i libri presenti nella cache locale
 */
export async function getAllBooksLocally(): Promise<Book[]> {
  if (checkIndexedDBSupport()) {
    try {
      const result = await performTransaction<Book[]>(BOOKS_STORE, "readonly", (store) => {
        return store.getAll();
      });
      if (result && Array.isArray(result) && result.length > 0) {
        result.forEach((b) => b?.id && memoryCache.books.set(b.id, b));
        return result;
      }
    } catch (e) {
      console.warn("Errore lettura tutti i libri da IndexedDB:", e);
    }
  }

  // Fallback memoryCache o localStorage
  if (memoryCache.books.size > 0) {
    return Array.from(memoryCache.books.values());
  }

  if (typeof window !== "undefined") {
    try {
      const list: Book[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("offline_book_")) {
          const val = localStorage.getItem(key);
          if (val) list.push(JSON.parse(val));
        }
      }
      return list;
    } catch {}
  }

  return [];
}

/**
 * Elimina un libro dalla cache locale
 */
export async function deleteBookLocally(id: string): Promise<void> {
  memoryCache.books.delete(id);

  if (checkIndexedDBSupport()) {
    try {
      await performTransaction(BOOKS_STORE, "readwrite", (store) => {
        store.delete(id);
      });
    } catch (e) {
      console.warn("Errore eliminazione libro da IndexedDB:", e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(`offline_book_${id}`);
    } catch {}
  }
}

// ==================== CODA DI SINCRONIZZAZIONE (OUTBOX) ====================

/**
 * Aggiunge o aggiorna un elemento nella coda di sincronizzazione
 */
export async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  memoryCache.syncQueue.set(item.id, item);

  if (checkIndexedDBSupport()) {
    try {
      await performTransaction(SYNC_QUEUE_STORE, "readwrite", (store) => {
        store.put(item);
      });
      return;
    } catch (e) {
      console.warn("Errore salvataggio sync queue su IndexedDB:", e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`sync_queue_${item.id}`, JSON.stringify(item));
    } catch {}
  }
}

/**
 * Rimuove un elemento dalla coda di sincronizzazione una volta completato
 */
export async function removeFromSyncQueue(id: string): Promise<void> {
  memoryCache.syncQueue.delete(id);

  if (checkIndexedDBSupport()) {
    try {
      await performTransaction(SYNC_QUEUE_STORE, "readwrite", (store) => {
        store.delete(id);
      });
    } catch (e) {
      console.warn("Errore rimozione sync queue da IndexedDB:", e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(`sync_queue_${id}`);
    } catch {}
  }
}

/**
 * Restituisce tutti gli elementi in sospeso nella coda di sincronizzazione
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  if (checkIndexedDBSupport()) {
    try {
      const result = await performTransaction<SyncQueueItem[]>(SYNC_QUEUE_STORE, "readonly", (store) => {
        return store.getAll();
      });
      if (result && Array.isArray(result)) {
        return result;
      }
    } catch (e) {
      console.warn("Errore lettura sync queue da IndexedDB:", e);
    }
  }

  if (memoryCache.syncQueue.size > 0) {
    return Array.from(memoryCache.syncQueue.values());
  }

  if (typeof window !== "undefined") {
    try {
      const queue: SyncQueueItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sync_queue_")) {
          const val = localStorage.getItem(key);
          if (val) queue.push(JSON.parse(val));
        }
      }
      return queue;
    } catch {}
  }

  return [];
}

/**
 * Pulisce l'intera coda di sincronizzazione
 */
export async function clearSyncQueue(): Promise<void> {
  memoryCache.syncQueue.clear();

  if (checkIndexedDBSupport()) {
    try {
      await performTransaction(SYNC_QUEUE_STORE, "readwrite", (store) => {
        store.clear();
      });
    } catch (e) {
      console.warn("Errore pulizia sync queue:", e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sync_queue_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  }
}

// ==================== STATO RETE ====================

/**
 * Controlla se il client è attualmente online
 */
export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return typeof navigator.onLine === "boolean" ? navigator.onLine : true;
}

/**
 * Iscrive un listener ai cambi di connettività di rete
 */
export function onNetworkChange(callback: (online: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
