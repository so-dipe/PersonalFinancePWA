import { getSetting } from "$lib/domains/settings";
import { microSync, syncAll } from ".";
import { cloudStorageProviders } from "$lib/providers";
import { syncState } from "$lib/stores/sync.store";

export async function runSync() {
    const { provider: providerName} = await getSetting("sync");

    if (!providerName) return;

    const provider = cloudStorageProviders[providerName];
    if (!provider) throw new Error(`Unknown sync provider: ${providerName}`);

    syncState.set({
        inProgress: true,
        status: 'syncing',
        message: 'Syncing...'
    });

    if (provider.init) await provider.init();

    try {
        await syncAll(provider);
        syncState.set({
            inProgress: false,
            phase: 'success',
            message: 'Sync complete'
        });
        return;
    } catch (e) {
        syncState.set({
            inProgress: false,
            phase: 'error',
            message: e.message
        })
        throw e;
    }
}

export async function runMicroSync(entity) {
    const { autosync, provider: providerName } = await getSetting("sync");

    if (!autosync) return;

    const provider = cloudStorageProviders[providerName];
    if (!provider) return;

    microSync(entity, provider);
} 