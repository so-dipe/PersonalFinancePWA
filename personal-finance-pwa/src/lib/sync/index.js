import { getSetting, setSetting } from "$lib/domains/settings"
import { SYNC_ENTITIES } from "./config"
import { pullEntity } from "./pull"
import { pushEntity } from "./push"

async function updateLastSynced() {
    const currentSync = await getSetting("sync");
    await setSetting("sync", {
        ...currentSync,
        lastSync: new Date().toISOString()
    })
}

export async function syncAll(provider) {
    const results = {};

    for (const entity of Object.keys(SYNC_ENTITIES)) {
        const remoteFiles = await provider.listFiles(entity);

        const pullResult = await pullEntity(
            entity,
            remoteFiles,
            provider.downloadFile
        );

        const pushCount = await pushEntity(
            entity,
            provider.uploadFile
        );

        results[entity] = {
            pulled: pullResult.pulled,
            merged: pullResult.merged,
            pushed: pushCount
        };
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