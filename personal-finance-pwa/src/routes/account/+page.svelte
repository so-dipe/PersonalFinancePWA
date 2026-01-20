<script>
    import { driveToken, googleProfile, ensureDriveToken, fetchGoogleProfile } from "$lib/google";
    import { saveSettings, settings } from "$lib/settings/store";
    import { get } from "svelte/store"
    import Settings from "$lib/features/settings/Settings.svelte";
    import { db, useSetting, setSetting, getSetting } from "$lib/db";
    import { formatDateTime } from "$lib/utils";
    import { syncAll } from "$lib/sync/sync";
    import { notify } from "$lib/stores/store";

    const account = useSetting('account');
    const sync = useSetting('sync');

    let isConnecting = false;
    let isSyncing = false;

    async function connectGoogleDrive() {
        isConnecting = true;
        try {
            const token = await ensureDriveToken({interactive: false}) ?? await ensureDriveToken({interactive: true});
            if (!token) return;

            await fetchGoogleProfile();
            const profile = get(googleProfile);

            if (profile) {
                const accountSetting = await getSetting('account');
                await setSetting('account', {
                    ...accountSetting,
                    ...profile,
                    setBy: 'google'
                })
            };

            const currentSync = await getSetting("sync");
            await setSetting('sync', {
                ...currentSync,
                enabled: true
            });
        } finally {
            isConnecting = false;
        }
    }

    async function disconnectGoogle() {
        localStorage.removeItem('g_token_drive');
        localStorage.removeItem('g_token_drive');
        driveToken.set(null);

        const currentSync = await getSetting('sync');
        await setSetting('sync', { ...currentSync, enabled: false });
    }

    async function manualSync() {
        if (isSyncing) return;
        isSyncing = true;
        try{
            await syncAll();
            notify({ type: "success", message: "Synced!🎉"})
        } catch (err) {
            notify({ type: "error", message: "Sync Failed.❌"})
        } finally {
            isSyncing = false;
        }
    }
    $: connectionStatus = $sync?.enabled ? `Connected as ${$account?.name}` : "Not Connected"
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
                    <a class="disconnect-link" on:click={disconnectGoogle}>Disconnect</a>
                {:else}
                    <a class="connect-link" on:click={connectGoogleDrive}>{isConnecting ? "Connecting...": "Connect to Google Drive"}</a>
                {/if}
                <br>
                <a class="sync-status" on:click={manualSync}>
                    {$sync?.enabled 
                        ? `Last synced: ${formatDateTime(new Date($sync?.lastSync))} ${isSyncing ? "(Syncing...)": ""}`: ""
                    }
                </a>
            </p>
        </div>
    </div>
    <Settings />
</div>

<style>
    .account-page {
        padding: var(--space-lg);
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }

    .account-top {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        margin-top: 10vh;
        margin-bottom: var(--space-lg);
        font-family: 'Montserrat', sans-serif;
    }


    .account-top .avatar {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
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
</style>