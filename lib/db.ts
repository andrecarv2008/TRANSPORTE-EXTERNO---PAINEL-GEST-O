import { Viagem } from './types';

const DB_NAME = 'frota_produtividade_db';
const STORE_NAME = 'viagens';
const DB_VERSION = 1;

/**
 * Initializes the IndexedDB database
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB cannot be initialized on server side'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Saves all viagens into IndexedDB
 */
export async function saveViagensToDB(viagens: Viagem[]): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Clear previous records first
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        let errorOccurred = false;
        
        // Add all records
        for (const v of viagens) {
          const addReq = store.put(v);
          addReq.onerror = () => {
            errorOccurred = true;
          };
        }

        transaction.oncomplete = () => {
          if (errorOccurred) {
            reject(new Error('Some records failed to save.'));
          } else {
            // Also store a backup or metadata check in localStorage
            localStorage.setItem('has_indexeddb_data', 'true');
            localStorage.setItem('viagens_count', String(viagens.length));
            resolve();
          }
        };

        transaction.onerror = () => {
          reject(transaction.error);
        };
      };

      clearRequest.onerror = () => {
        reject(clearRequest.error);
      };
    });
  } catch (err) {
    console.warn('Failed to save to IndexedDB, falling back to LocalStorage:', err);
    try {
      localStorage.setItem('viagens_fallback', JSON.stringify(viagens));
    } catch (localErr) {
      console.error('LocalStorage also exceeded quota limits:', localErr);
    }
  }
}

/**
 * Retrieves all saved viagens
 */
export async function getViagensFromDB(): Promise<Viagem[] | null> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const data = request.result;
        if (data && data.length > 0) {
          resolve(data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn('Failed to get from IndexedDB, trying LocalStorage fallback:', err);
    try {
      const fallback = localStorage.getItem('viagens_fallback');
      if (fallback) {
        return JSON.parse(fallback);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }
}

/**
 * Clears the database completely
 */
export async function clearViagensFromDB(): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        localStorage.removeItem('has_indexeddb_data');
        localStorage.removeItem('viagens_count');
        localStorage.removeItem('viagens_fallback');
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error(err);
    localStorage.removeItem('has_indexeddb_data');
    localStorage.removeItem('viagens_count');
    localStorage.removeItem('viagens_fallback');
  }
}
