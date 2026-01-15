import { writable, get } from 'svelte/store';
import { db } from '$lib/db';
import { defaultSettings } from "./settings";
import { pullSettingsFromDrive } from '$lib/sync/settings';

export const settings = writable(loadSettings());

export async function loadSettings() {
    const saved = await db.settings.get('app');

    if (saved?.value) {
        settings.set(saved.value);
        // if (saved.value.sync.enabled) {
        //     return pullSettingsFromDrive(saved.value);
        // }
        return saved.value;
    }

    await saveSettings(defaultSettings);
    return defaultSettings;
}

export async function saveSettings(value) {

    value = {
        ...get(settings),
        ...value,
        modifiedAt: new Date().toISOString(),
        synced: 0
    };

    await db.settings.put({ key: 'app', value });
    settings.set(value);
}