import { getSetting } from "$lib/domains/settings";
import { microSync, syncAll } from ".";
import { cloudStorageProviders } from "$lib/providers";

export async function runSync() {
    const { provider: providerName} = await getSetting("sync");

    if (!providerName) return;

    const provider = cloudStorageProviders[providerName];
    if (!provider) throw new Error(`Unknown sync provider: ${providerName}`);

    if (provider.init) await provider.init();

    return syncAll(provider);
}

export async function runMicroSync(entity) {
    const { autosync, provider: providerName } = await getSetting("sync");

    if (!autosync) return;

    const provider = cloudStorageProviders[providerName];
    if (!provider) return;

    microSync(entity, provider);
} 