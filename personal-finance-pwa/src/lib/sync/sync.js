import { uploadFile, downloadFile, listDriveFiles } from "../google";
import { db } from "../db";
import { settings, saveSettings } from "$lib/settings/store";
import { get } from "svelte/store";

async function updateLastSynced() {
    const current = get(settings);
    await saveSettings({
        ...current,
        sync: {
            ...current.sync,
            lastSynced: new Date().toISOString(),
            status: 'idle'
        }
    })
}

export async function syncEntity(entityName) {

    let pushed = 0;
    let pulled = 0;

    try {
        const unsynced = await db[entityName].where('synced').equals(0).toArray();
        for (const item of unsynced) {
            await uploadFile(`${entityName}-${item.uuid}.json`, item);
            await db[entityName].update(item.id, { synced: 1, modifiedAt: new Date().toISOString() });
            pushed++;
        }

        const driveFiles = await listDriveFiles(entityName+'-');
        for (const file of driveFiles) {
            const uuid = file.name.replace(`${entityName}-`, "").replace(".json", "");
            const localItem = await db[entityName].where('uuid').equals(uuid).first();

            const remoteItemProperties = {
                uuid: file.appProperties.u,
                modifiedAt: file.appProperties.m,
                createdAt: file.appProperties.c,
                synced: file.appProperties.s,
                deleted: file.appProperties.d
            }
            
            if (!localItem && remoteItemProperties.deleted === 1) continue;
            if (!localItem) {
                const remoteItem = await downloadFile(file.id);
                delete remoteItem.id;
                await db[entityName].add({...remoteItem, synced: 1});
                pulled++;
                continue;
            }

            const remoteModified = new Date(remoteItemProperties.modifiedAt)
            const localModified = new Date(localItem.modifiedAt)

            if (remoteModified <= localModified) continue;
            if (localItem && remoteItemProperties.deleted ===1) {
                await db[entityName].where('uuid').equals(uuid).delete();
                pulled++;
                continue;
            }
            if (remoteModified > new localModified) {
                const remoteItem = await downloadFile(file.id);
                delete remoteItem.id;
                await db[entityName].update(localItem.id, {...remoteItem, synced: 1});
                pulled++;
                continue;
            }
        }
    await updateLastSynced();
    } catch (err) {
        console.error("Sync failed for entity", entityName, err)
    }
    return { pushed, pulled };
}

export function microTaskSyncEntity(entityName) {
    let pushed = 0;
    let pulled = 0;
    queueMicrotask(async() => {
        try {
            pushed, pulled = await syncEntity(entityName);
        } catch (err) {
            throw new Error(`Sync deffered for ${entityName}`);
        }
    });
    return pushed, pulled
}

export async function syncAll() {
    try {
        const results = {};
        for (const entity of ['transactions', 'categories']) {
            results[entity] = await syncEntity(entity);
        }
        return results;
    } catch (err) {
        throw new Error('Syncing failed, need to reauthenticate', err);
    }
}
