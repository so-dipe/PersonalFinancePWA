import { uploadFile, downloadFile, listDriveFiles } from "../google";
import { db } from "../db";

export async function syncEntity(entityName) {

    const unsynced = await db[entityName].where('synced').equals(0).toArray();

    let pushed = 0;

    for (const item of unsynced) {
        await uploadFile(`${entityName}-${item.uuid}.json`, item);
        await db[entityName].update(item.id, { synced: 1, modifiedAt: new Date().toISOString() });
        pushed++;
    }

    const driveFiles = await listDriveFiles(entityName+'-');

    let pulled = 0;
    
    for (const file of driveFiles) {
        const uuid = file.name.replace(`${entityName}-`, "").replace(".json", "");
        const localItem = await db[entityName].where('uuid').equals(uuid).first();

        try {
            const remoteItemProperties = {
                uuid: file.appProperties.u,
                modifiedAt: file.appProperties.m,
                createdAt: file.appProperties.c,
                synced: file.appProperties.s,
                deleted: file.appProperties.d
            }
            const remoteModified = new Date(remoteItemProperties.modifiedAt)
            const localModified = new Date(localItem.modifiedAt)

            if (!localItem && remoteItemProperties.deleted === 1) continue;
            if (remoteModified <= localModified) continue;
            if (!localItem) {
                const remoteItem = await downloadFile(file.id, token);
                delete remoteItem.id;
                await db[entityName].add({...remoteItem, synced: 1});
                pulled++;
                continue;
            }
            if (localItem && remoteItemProperties.deleted ===1) {
                await db[entityName].where('uuid').equals(uuid).delete();
                pulled++;
                continue;
            }
            if (new Date(remoteItemProperties.modifiedAt) > new Date(localItem.modifiedAt)) {
                const remoteItem = await downloadFile(file.id);
                delete remoteItem.id;
                await db[entityName].update(localItem.id, {...remoteItem, synced: 1});
                pulled++;
                continue;
            }
        } catch (err) {
            console.log(`Failed to download file ${file.name}: `, err);
            continue;
        }
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
