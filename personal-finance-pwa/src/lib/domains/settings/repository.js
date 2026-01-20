import { DEFAULT_SETTINGS } from "$lib/constants/default.settings";
import { db } from "$lib/db";
import { liveQuery } from "dexie";
import { validateSettingKey } from "./rules";

export async function loadDefaultSettings() {
    const settings = await db.settings.toArray();

    const now = new Date().toISOString();
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        const existing = await db.settings.where('key').equals(key).first();
        if (existing) continue;
        
        await db.settings.add({
            uuid: key,
            key,
            value,
            createdAt: now,
            modifiedAt: now,
            synced: 0,
            deleted: 0
        });
    }
}

export async function getSetting(key) {
    validateSettingKey(key);

    const record = await db.settings.get({ key });
    if (!record) return DEFAULT_SETTINGS[key];

    return record.value;
}

export async function setSetting(key, value) {
    validateSettingKey(key);

    const now = new Date().toISOString();
    const existing = await db.settings.get({ key });

    if (existing) {
        await db.settings.update(existing.id, {
            value,
            modifiedAt: now,
            synced: 0
        });
    } else {
        await db.settings.add({
            uuid: key,
            key,
            value,
            createdAt: now,
            modifedAt: now,
            synced: 0,
            deleted: 0
        });
    }
}

export function useSetting(key) {
    validateSettingKey(key);

    const fallback = DEFAULT_SETTINGS[key];

    return liveQuery(async () => {
        const record = await db.settings.get({ key });
        return record?.value ?? fallback;
    })
}