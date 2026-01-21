import { db } from "$lib/db";
import { reconcileByFingerprint } from "./reconcile";
import { SYNC_ENTITIES } from "./config";
import { makeFingerprint as makeTxnFingerprint } from "$lib/domains/transactions";
import { makeFingerprint as makeCatFingerprint } from "$lib/domains/categories";

const FINGERPRINT_BUILDERS = {
    transactions: makeTxnFingerprint,
    categories: makeCatFingerprint
}

function extractRemoteProps(file) {
    return {
        uuid: file.metadata.u,
        modifiedAt: new Date(file.metadata.m),
        createdAt: new Date(file.metadata.c),
        synced: file.metadata.s,
        deleted: file.metadata.d
    }
}

export async function pullSession(getRemoteFiles, downloadFile) {
    const context = {
        uuidMaps: { categories: new Map() }
    };

    const {pulledCat, mergedCat} = await pullCategories(
        await getRemoteFiles("categories"),
        downloadFile,
        context
    );

    const {pulledTxs, mergedTxs} = await pullEntity(
        "transactions",
        await getRemoteFiles("transactions"),
        downloadFile,
        context
    )

    //No budgets yet.
    // const {pulledBud, mergedBud} = await pullEntity(
    //     "budgets",
    //     getRemoteFiles("budgets"),
    //     downloadFile,
    //     context
    // )

    const {pulledSet, mergedSet} = await pullEntity(
        "settings",
        await getRemoteFiles("settings"),
        downloadFile
    )

    return {
        categories: { pulledCat, mergedCat },
        transactions: { pulledTxs, mergedTxs },
        // budgets: { pulledBud, mergedBud },
        settings: { pulledSet, mergedSet }
    }
}

export async function pullEntity(entity, remoteFiles, downloadFile, context) {
    let pulled = 0;
    let merged = 0;

    if (entity !== "categories" && context && context.uuidMaps.categories.size === 0) {
        console.warn("No categories were pulled, continuing the mission...");
    }

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
        if (context && remote.categoryUuid) {
            const originalRemoteCatUuid = remote.categoryUuid;
            remote.categoryUuid = context.uuidMaps.categories.get(originalRemoteCatUuid) ?? null;
            console.log(remote);
            if (!remote.categoryUuid) {
                console.warn(`Remote category ${remote.categoryUuid} has no mapping.`);
            }
        }
        delete remote.id;

        if (SYNC_ENTITIES[entity]?.dedupeByFingerprint) {
            remote.fingerprint = FINGERPRINT_BUILDERS[entity](remote);
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

export async function pullCategories(remoteFiles, downloadFile, context) {
    let pulled = 0, merged = 0;
    for (const file of remoteFiles) {
        const uuid = file.name.replace('.json', '').replace('categories-', '');

        const remote = await downloadFile(file.id);
        delete remote.id;

        const local = await db.categories.where('fingerprint').equals(remote.fingerprint).first();

        if (local) {
            context.uuidMaps.categories.set(uuid, local.uuid);
            await db.categories.update(local.id, {
                name: new Date(remote.modifiedAt) > new Date(local.modifiedAt) ? remote.name : local.name,
                transactionType: new Date(remote.modifiedAt) > new Date(local.modifiedAt) ? remote.transactionType : local.transactionType,
                synced: 1,
                deleted: remote.deleted ?? local.deleted
            });
            merged++;
            continue;
        }

        await db.categories.add({
            ...remote,
            synced: 1
        });
        pulled++;
        context.uuidMaps.categories.set(uuid, uuid);
    }
    return { pulled, merged }
}
