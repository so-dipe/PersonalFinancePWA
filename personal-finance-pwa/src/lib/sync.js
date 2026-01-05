import { ensureValidToken, uploadFile, login, downloadFile, listDriveFiles } from "./drive";
import { db } from "./db";

export async function syncEntity(entityName, token) {

    const unsynced = await db[entityName].where('synced').equals(0).toArray();
    let pushed = 0;
    for (const item of unsynced) {
        await uploadFile(`${entityName}-${item.uuid}.json`, item, token);
        await db[entityName].update(item.id, { synced: 1});
        pushed++;
    }

    const driveFiles = await listDriveFiles(entityName, token);
    let pulled = 0;
    for (const file of driveFiles) {

        const uuid = file.name.replace(`${entityName}-`, "").replace(".json", "");
        const localItem = await db[entityName].where('uuid').equals(uuid).first();
        try {
            const remoteItem = await downloadFile(file.id, token);
            delete remoteItem.id;

            if (!localItem && remoteItem.deleted === 1) continue;
            if (!localItem) {
                await db[entityName].add({...remoteItem, synced: 1});
                pulled++;
                continue;
            }
            if (localItem && remoteItem.deleted ===1) {
                await db[entityName].where('uuid').equals(uuid).delete();
                pulled++;
                continue;
            }
            if (new Date(remoteItem.modifiedAt) > new Date(localItem.modifiedAt)) {
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
    queueMicrotask(async() => {
        try {
            const token = await ensureValidToken();
            if (!token) return;
            await syncEntity(entityName, token);
        } catch (err) {
            console.log(`Sync deferred for ${entityName}`);
        }
    });
}

export async function syncAll() {
    try {
        const token = await ensureValidToken();
        if (!token) {
            console.log('No valid token, cannot sync');
            return;
        }
        const results = {};
        for (const entity of ['transactions', 'categories']) {
            results[entity] = await syncEntity(entity, token);
        }
        return results;
    } catch (err) {
        console.log('Sync all failed, need to reauthenticate', err);
    }
}
