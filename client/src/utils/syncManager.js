import api from '../services/api';
import { 
    getOfflineBatches, 
    deleteOfflineBatch, 
    getOfflinePhotos, 
    deleteOfflinePhoto 
} from './db';
import toast from 'react-hot-toast';

let isSyncing = false;

export const syncOfflineData = async () => {
    if (isSyncing || !navigator.onLine) return;
    isSyncing = true;

    try {
        // 1. Sync Batches First
        const offlineBatches = await getOfflineBatches();
        for (const batch of offlineBatches) {
            try {
                // Create the batch on the server
                const payload = {
                    title: batch.title,
                    description: batch.description,
                    location: batch.location,
                };
                if (batch.client) payload.client = batch.client;

                const res = await api.post('/batches', payload);
                const realBatchId = res.data.batch._id;

                // Now find all offline photos that belong to this temp batch
                const offlinePhotos = await getOfflinePhotos();
                const photosForThisBatch = offlinePhotos.filter(p => p.batchId === batch.tempId);

                // Upload these photos to the new real batch ID
                for (const photo of photosForThisBatch) {
                    await api.post('/photos', {
                        batchId: realBatchId,
                        originalImage: photo.originalImage,
                        blurredImage: photo.blurredImage,
                        aiMetadata: photo.aiMetadata,
                        location: photo.location,
                    });
                    await deleteOfflinePhoto(photo.id); // clean up
                }

                // Delete the offline batch
                await deleteOfflineBatch(batch.tempId);
                toast.success(`Synced batch: ${batch.title}`);

            } catch (err) {
                console.error('Failed to sync batch:', batch.title, err);
                toast.error(`Failed to sync batch: ${batch.title}`);
            }
        }

        // 2. Sync independent offline photos (photos added to already-online batches while offline)
        const remainingPhotos = await getOfflinePhotos();
        for (const photo of remainingPhotos) {
            // Only process if it belongs to a real MongoDB ID (not a tempId)
            if (!photo.batchId.startsWith('offline-')) {
                try {
                    await api.post('/photos', {
                        batchId: photo.batchId,
                        originalImage: photo.originalImage,
                        blurredImage: photo.blurredImage,
                        aiMetadata: photo.aiMetadata,
                        location: photo.location,
                    });
                    await deleteOfflinePhoto(photo.id);
                } catch (err) {
                    console.error('Failed to sync photo for batch', photo.batchId);
                }
            }
        }

        if (offlineBatches.length > 0 || remainingPhotos.length > 0) {
            toast.success('All offline data synced successfully!');
            // Reload the page to show updated data
            window.location.reload();
        }

    } catch (error) {
        console.error('Sync process failed:', error);
    } finally {
        isSyncing = false;
    }
};

// Add global listener to trigger sync when coming online
window.addEventListener('online', () => {
    // Wait a few seconds for connection to stabilize before syncing
    setTimeout(syncOfflineData, 3000);
});
