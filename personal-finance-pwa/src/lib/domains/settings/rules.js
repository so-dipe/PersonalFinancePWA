import { DEFAULT_SETTINGS } from "$lib/constants/default.settings";

export function validateSettingKey(key) {
    if (!(key in DEFAULT_SETTINGS)) throw new Error(`Unknown setting key: ${key}`);
}