import { db } from "$lib/db";

export async function pushEntity(entity, uploadFile) {
    const unsynced = await db[entity]
        .where('synced')
        .equals(0)
        .toArray();

    let pushed = 0;

    for (const item of unsynced) {
        await uploadFile(`${entity}-${item.uuid}.json`, item);
        await db[entity].update(item.id, { synced: 1 });
        pushed++;
    }

    return pushed;
}