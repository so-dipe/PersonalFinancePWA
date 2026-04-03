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

export async function pullSession(
    getRemoteFiles, 
    downloadFile,
    progress
) {

    // 1️⃣ Pull categories first
    const { pulledCat, mergedCat } = await pullCategories(
        await getRemoteFiles("categories"),
        downloadFile, progress
    );

    // 2️⃣ Pull transactions
    const { pulledTxs, mergedTxs } = await pullEntity(
        "transactions",
        await getRemoteFiles("transactions"),
        downloadFile, progress
    );

    // 3️⃣ Pull budgets
    const { pulledBud, mergedBud } = await pullEntity(
        "budgets",
        await getRemoteFiles("budgets"),
        downloadFile, progress
    );

    // 4️⃣ Pull settings
    const { pulledSet, mergedSet } = await pullEntity(
        "settings",
        await getRemoteFiles("settings"),
        downloadFile, progress
    );

    return {
        categories: { pulledCat, mergedCat },
        transactions: { pulledTxs, mergedTxs },
        budgets: { pulledBud, mergedBud },
        settings: { pulledSet, mergedSet }
    };
}


export async function pullEntity(entity, remoteFiles, downloadFile, progress) {
    let pulled = 0;
    let merged = 0;

    progress.setTotal(remoteFiles.length);

    for (const file of remoteFiles) {

        progress.step(
            `Downloading ${entity}...`,
            { entity, phase: 'pulling' }
        );

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
            // remote.fingerprint = FINGERPRINT_BUILDERS[entity](remote);
            const match = await reconcileByFingerprint(entity, remote);
            if (match) {
                await db[entity].update(match.id, { synced: 1 });
                merged++;
                continue;
            }
        }

        await db[entity].add({
            ...remote,
            uuid,
            synced: 1
        });

        pulled++;
    }

    return { pulled, merged };
}

export async function pullCategories(remoteFiles, downloadFile, progress) {

    let pulled = 0, merged = 0;

    progress.setTotal(remoteFiles.length);

    for (const file of remoteFiles) {

        progress.step(
            `Downloading Categories...`,
            { entity: 'categories', phase: 'pulling' }
        );

        const uuid = file.name.replace('.json', '').replace('categories-', '');
        const local = await db.categories
            .where('uuid')
            .equals(uuid)
            .first();
        const localModifedAt = local ? new Date(local.modifiedAt) : null;
        
        const remoteProps = extractRemoteProps(file);

        if (!local && remoteProps.deleted === 1) continue;
        if (localModifedAt && remoteProps.modifiedAt <= localModifedAt) continue;
        if (local && remoteProps.deleted === 1) {
            await db.categories
                .where('uuid')
                .equals(uuid)
                .modify({
                    synced: 1,
                    deleted: 1,
                    modifiedAt: remoteProps.modifiedAt
                });
                continue;
        }

        const remote = await downloadFile(file.id);
        delete remote.id

        if (local) {
            await db.categories.update(local.id, {
                ...remote,
                synced: 1
            });
            continue;
        }

        const fingerprintMatch = await reconcileByFingerprint("categories", remote);
        if (fingerprintMatch) {
            const oldUuid = fingerprintMatch.uuid;
            const newUuid = remote.uuid;

            await db.categories.update(fingerprintMatch.id, {
                synced: 1, 
                uuid: newUuid
            });

            await remapDependentEntities(oldUuid, newUuid);
            merged++;
            continue;
        }

        await db.categories.add({
            ...remote,
            synced: 1
        });
        pulled++;
    }

    return { pulled, merged }
}

async function remapDependentEntities(oldUuid, newUuid) {
    const entities = ['transactions', 'budgets'];

    for (const entity of entities) {
        await db[entity]
            .where('categoryUuid')
            .equals(oldUuid)
            .modify({
                categoryUuid: newUuid,
                synced: 0
            });
    }
}
