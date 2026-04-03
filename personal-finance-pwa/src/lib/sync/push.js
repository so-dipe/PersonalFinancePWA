import { db } from "$lib/db";

export async function pushEntity(entity, uploadFile, progress) {
    const unsynced = await db[entity]
        .where('synced')
        .equals(0)
        .toArray();

    progress.setTotal(unsynced.length);

    for (const item of unsynced) {
        await uploadFile(`${entity}-${item.uuid}.json`, item);

        await db[entity].update(item.id, { synced: 1 });

        progress.step(
            `Uploading ${entity}...`,
            { entity, phase: 'pushing'}
        )
    }

    return unsynced.length;
}