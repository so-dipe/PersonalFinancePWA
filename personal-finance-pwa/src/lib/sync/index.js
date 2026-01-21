import { getSetting, setSetting } from "$lib/domains/settings"
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
    let results = {};

    results = await pullSession(provider.listFiles, provider.downloadFile)

    for (const entity of Object.keys(SYNC_ENTITIES)) {
        await pushEntity(entity, provider.uploadFile);
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