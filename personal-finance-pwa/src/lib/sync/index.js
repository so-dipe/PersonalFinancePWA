import { db } from "$lib/db";
import { getSetting, setSetting } from "$lib/domains/settings"
import { createProgressReporter, syncState } from "$lib/stores/sync.store";
import { SYNC_ENTITIES } from "./config"
import { pullSession } from "./pull"
import { pushEntity } from "./push"

async function updateLastSynced() {
    const currentSync = await getSetting("sync");
    await setSetting("sync", {
        ...currentSync,
        lastSync: new Date().toISOString()
    })
}

export async function syncAll(provider) {
    const progress = createProgressReporter();

    // const storesUnsyncedCount = await Promise.all(
    //     Object.keys(SYNC_ENTITIES).map(async (entity) => {
    //         const unsynced = await db[entity].where('synced').equals(0).count();
    //         return unsynced;
    //     })
    // )

    // const totalPushCount = storesUnsyncedCount.reduce((a, b) => a + b, 0);

    // progress.setTotal(totalPushCount);

    syncState.update(s => ({...s, phase: 'pulling'}));
    const results = await pullSession(
        provider.listFiles,
        provider.downloadFile,
        progress
    )

    syncState.update(s => ({...s, phase: 'pushing'}));
    for (const entity of Object.keys(SYNC_ENTITIES)) {
        await pushEntity(
            entity, 
            provider.uploadFile,
            progress
        );
    }

    await updateLastSynced();

    return results;
}

export function microSync(entity, provider) {
    queueMicrotask(async () => {
        try {
            await pushEntity(entity, provider.uploadFile);
        } catch (e) {
            console.warn(`Micro-sync failed for ${entity}`);
        }
    });
}