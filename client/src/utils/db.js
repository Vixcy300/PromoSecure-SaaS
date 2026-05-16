import { openDB } from 'idb';

const DB_NAME = 'PromoSecureDB';
const DB_VERSION = 1;

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Store for offline photos waiting to be uploaded
            if (!db.objectStoreNames.contains('offline_photos')) {
                const store = db.createObjectStore('offline_photos', { keyPath: 'id', autoIncrement: true });
                store.createIndex('batchId', 'batchId');
                store.createIndex('timestamp', 'timestamp');
            }

            // Store for offline batches waiting to be created
            if (!db.objectStoreNames.contains('offline_batches')) {
                const store = db.createObjectStore('offline_batches', { keyPath: 'tempId' });
                store.createIndex('timestamp', 'timestamp');
            }

            // Store for cached data (e.g. recent batches) for offline viewing
            if (!db.objectStoreNames.contains('cached_data')) {
                db.createObjectStore('cached_data');
            }
        },
    });
};

// --- Offline Photos Queue ---

export const saveOfflinePhoto = async (photoData) => {
    const db = await initDB();
    const id = await db.add('offline_photos', {
        ...photoData,
        timestamp: Date.now(),
    });
    return id;
};

export const getOfflinePhotos = async (batchId = null) => {
    const db = await initDB();
    if (batchId) {
        const tx = db.transaction('offline_photos', 'readonly');
        const index = tx.store.index('batchId');
        return index.getAll(batchId);
    }
    return db.getAll('offline_photos');
};

export const deleteOfflinePhoto = async (id) => {
    const db = await initDB();
    return db.delete('offline_photos', id);
};

export const clearOfflinePhotosForBatch = async (batchId) => {
    const db = await initDB();
    const tx = db.transaction('offline_photos', 'readwrite');
    const index = tx.store.index('batchId');
    const cursor = await index.openCursor(batchId);
    
    let deletedCount = 0;
    let curr = cursor;
    while (curr) {
        await curr.delete();
        deletedCount++;
        curr = await curr.continue();
    }
    await tx.done;
    return deletedCount;
};

// --- Offline Batches Queue ---

export const saveOfflineBatch = async (batchData) => {
    const db = await initDB();
    // Use a temporary ID starting with 'offline-' to distinguish from real MongoDB IDs
    const tempId = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db.put('offline_batches', {
        ...batchData,
        tempId,
        timestamp: Date.now(),
        isOfflineSync: true
    });
    return tempId;
};

export const getOfflineBatches = async () => {
    const db = await initDB();
    return db.getAll('offline_batches');
};

export const deleteOfflineBatch = async (tempId) => {
    const db = await initDB();
    return db.delete('offline_batches', tempId);
};

// --- Cached Data (Read-only offline viewing) ---

export const cacheData = async (key, data) => {
    const db = await initDB();
    return db.put('cached_data', data, key);
};

export const getCachedData = async (key) => {
    const db = await initDB();
    return db.get('cached_data', key);
};
