import { db } from "$lib/db";
import { reconcileByFingerprint } from "./reconcile";
import { SYNC_ENTITIES } from "./config";

function extractRemoteProps(file) {
    return {
        uuid: file.metadata.u,
        modifiedAt: new Date(file.metadata.m),
        createdAt: new Date(file.metadata.c),
        synced: file.metadata.s,
        deleted: file.metadata.d
    }
}

export async function pullEntity(entity, remoteFiles, downloadFile) {
    let pulled = 0;
    let merged = 0;

    for (const file of remoteFiles) {
        const uuid = file.name.replace('.json', '').replace(`${entity}-`, '');
        
        const local = await db[entity].where('uuid').equals(uuid).first();
        const localModifiedAt = local ? new Date(local.modifiedAt): null;

        const remoteProps = extractRemoteProps(file);

        if (!local && remoteProps.deleted === 1) continue;

        if (localModifiedAt && remoteProps.modifiedAt <= localModifiedAt) continue;

        if (local && remoteProps.deleted === 1) {
            await db[entity]
                .where('uuid')
                .equals(uuid)
                .modify({
                    deleted: 1,
                    synced: 1,
                    modifiedAt: remoteProps.modifiedAt
                });
            continue;
        }

        const remote = await downloadFile(file.id);
        delete remote.id;

        if (SYNC_ENTITIES[entity]?.dedupeByFingerprint) {
            const match = await reconcileByFingerprint(entity, remote);
            if (match) {
                await db[entity].update(match.id, { synced: 1 });
                merged++;
                continue;
            }
        }

        await db[entity].add({
            ...remote,
            synced: 1
        });
        pulled++;
    }

    return { pulled, merged };
}