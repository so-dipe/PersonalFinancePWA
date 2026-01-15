<script>
    import { driveToken, googleProfile, ensureDriveToken, fetchGoogleProfile } from "$lib/google";
    import { saveSettings, settings } from "$lib/settings/store";
    import { get } from "svelte/store"
    import Settings from "$lib/components/Settings.svelte";
    import { db } from "$lib/db";

    let isSyncing = false;

    async function handleSyncButton() {
        isSyncing = true;
        try {
            const token = await ensureDriveToken({interactive: false}) ?? await ensureDriveToken({interactive: true});
            if (!get(driveToken)) return;

            await fetchGoogleProfile();
            const profile = get(googleProfile);

            if (profile) {
                await saveSettings({
                    ...get(settings),
                    account: profile
                })
            };

            await saveSettings({
                ...get(settings),
                sync: {
                    ...get(settings).sync,
                    enabled: true,
                }
            });
        } finally {
            isSyncing = false;
        }
        
    }
</script>

<div class="account-page">
    <div class="account-top">
        <img class="avatar" src={$settings.account?.picture} alt="Profile Picture">
        <div class="user-info">
            <h2>{$settings.account?.name}</h2>
            <button class="sync-btn" on:click={async () => await handleSyncButton()} disabled={$settings.sync?.enabled || isSyncing}>
                {isSyncing ? "Syncing..." : "Sync with Google Drive"}
            </button>
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


    .user-info h2 {
        font-size: 1.8rem;
        font-weight: 900;
        margin: 0;
    }


    .sync-btn {
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        font-weight: 600;
        border-radius: var(--radius-md);
        border: none;
        background: var(--green-900);
        color: white;
        cursor: pointer;
        transition: background 0.2s ease;
    }


    .sync-btn:hover {
        background: var(--green-700);
    }

</style>