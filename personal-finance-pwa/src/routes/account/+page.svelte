<script>
    import Settings from "$lib/features/settings/Settings.svelte";
    import { useSetting, getSetting, setSetting } from "$lib/domains/settings";
    import { formatDateTime } from "$lib/utils";
    import { runSync } from "$lib/sync/runSync";
    import { notify } from "$lib/stores/notification.store";
    import { syncState } from "$lib/stores/sync.store";
    import { cloudStorageProviders } from "$lib/providers";
    import { CLOUD_STORAGE_PROVIDERS_NAME_MAP } from "$lib/constants/constants";
    import { get } from "svelte/store";
    import { DEFAULT_SETTINGS } from "$lib/constants/default.settings";

    const account = useSetting('account');
    const sync = useSetting('sync');

    let selectedProvider = $sync?.provider || "google";
    $: provider = selectedProvider ? cloudStorageProviders[selectedProvider] : null;

    let isConnecting = false;

    async function connectProvider() {
        if (!provider) return;
        isConnecting = true;
        try {
            const profile = await provider.connect();
            const currentSync = await getSetting('sync');
            await setSetting('sync', {
                ...currentSync,
                enabled: true,
                provider: selectedProvider
            });

            if (!profile) return;
            const accountSetting = await getSetting('account');
            if (accountSetting.setBy === "user") return;
            await setSetting('account', {
                ...accountSetting,
                ...profile,
                setBy: selectedProvider
            });
        } catch (e) {
            console.error(`An error occured while connecting to ${selectedProvider}:`, e)
            notify({type: "error", message: `An error occured while connecting to ${CLOUD_STORAGE_PROVIDERS_NAME_MAP[selectedProvider]}: ${e}`})
        } finally {
            isConnecting = false;
        }
    }

    async function disconnectProvider() {
        const currentSync = await getSetting("sync");
        if (!currentSync.provider) return;

        const provider = cloudStorageProviders[currentSync.provider];

        if (provider?.disconnect) {
            await provider.disconnect();
        }

        await setSetting('sync', {
            ...currentSync,
            enabled: false,
            autoSync: false
        });

        const accountSetting = await getSetting('account');
        if (accountSetting.setBy === currentSync.provider) {
            await setSetting('account', {
                ...accountSetting,
                ...DEFAULT_SETTINGS['account']
            });
        }
    }

    async function manualSync() {
        if ($syncState.inProgress) return;
        try{
            await runSync();
            notify({ type: "success", message: "Synced!🎉"})
        } catch (err) {
            notify({ type: "error", message: "Sync Failed.❌"})
        } 
    }
    $: connectionStatus = $sync?.enabled ? `Connected to ${CLOUD_STORAGE_PROVIDERS_NAME_MAP[$sync?.provider]} as ${$account?.name}` : "Not Connected"
</script>

<div class="account-page">
    <div class="account-top">
        <img class="avatar" src={$account?.picture} alt="Profile">
        <div class="user-info">
            <h3>{$account?.name ?? "Your Account"}</h3>
            <p class="status">
                {connectionStatus}
                {#if $sync?.enabled}
                    &nbsp; | &nbsp;
                    <a class="disconnect-link" on:click={disconnectProvider}>Disconnect</a>
                {:else}
                    <a class="connect-link" on:click={connectProvider}>{isConnecting ? "Connecting...": `Connect to ${CLOUD_STORAGE_PROVIDERS_NAME_MAP[selectedProvider] || "Provider"}`}</a>
                {/if}
                <select bind:value={selectedProvider} disabled={$sync?.enabled}>
                    {#each Object.keys(cloudStorageProviders) as key}
                        <option value={key}>{CLOUD_STORAGE_PROVIDERS_NAME_MAP[key]}</option>
                    {/each}
                </select>
                <br>
                {#if $sync?.enabled}
                <a class="sync-status" on:click={manualSync}>
                    {$syncState.inProgress
                        ? $syncState.message
                        : `Last synced: ${formatDateTime(new Date($sync?.lastSync))}`
                    }
                </a>
                {/if}
            </p>
        </div>
    </div>
    <Settings />
</div>

<style>
    .account-page {
        padding: clamp(8px, 2vw, 20px);
        max-width: 900px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }

    .account-top {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        margin-top: 4vh;
        margin-bottom: var(--space-lg);
        padding: var(--space-lg);
        border-radius: var(--radius-lg);
        border: 1px solid var(--gray-200);
        background: var(--surface-2);
    }


    .account-top .avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid white;
        box-shadow: var(--shadow-sm);
    }


    .user-info h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
    }

    .user-info .status {
        font-size: 0.95rem;
        margin-top: 0.25rem;
        color: var(--gray-700);
    }

    .connect-link, .disconnect-link {
        color: var(--green-900);
        cursor: pointer;
        font-weight: 600;
    }


    .connect-link:hover, .disconnect-link:hover {
        color: var(--green-500);
    }

    @media (max-width: 720px) {
        .account-top {
            flex-direction: column;
            align-items: flex-start;
        }

        .account-top .avatar {
            width: 96px;
            height: 96px;
        }
    }
</style>
