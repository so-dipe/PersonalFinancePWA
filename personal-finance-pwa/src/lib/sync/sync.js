import { uploadFile, downloadFile, listDriveFiles } from "../google";
import { db } from "../db";
import { get } from "svelte/store";

async function updateLastSynced() {
    const currentSync = await getSetting("sync");
    await setSetting('sync', {
        ...currentSync,
        lastSync: new Date().toISOString()
    });
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
                await db[entityName].where('uuid').equals(uuid).modify({
                        deleted: 1,
                        synced: 1,
                        modifiedAt: remoteItemProperties.modifiedAt
                    });
                pulled++;
                continue;
            }
            if (remoteModified > localModified) {
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
    queueMicrotask(() => {
        syncEntity(entityName).catch(err =>
            console.error(`Deferred sync failed for ${entityName}`, err)
        );
    });
}

export async function syncAll() {
    const results = {};
    for (const entity of ["transactions", "categories", "settings"]) {
        results[entity] = await syncEntity(entity);
    }
    return results;
}
