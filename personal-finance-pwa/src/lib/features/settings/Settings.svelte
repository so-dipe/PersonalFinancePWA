<script>
    import ManageCategories from './ManageCategories.svelte';
    import ToggleSwitch from '../../components/ToggleSwitch.svelte';
    import { get } from 'svelte/store';
    import { useSetting, getSetting, setSetting } from '$lib/domains/settings';
    import { notify } from '$lib/stores/notification.store';

    const syncSetting = useSetting("sync");
    const displaySetting = useSetting("display");

    async function updateAutoSync(value) {
        try {
            const current = await getSetting("sync");
            await setSetting("sync", {
                ...current,
                autoSync: value
            });
            notify({ type: "success", message: `Auto Sync ${value ? 'enabled' : 'disabled'}` });
        } catch (err) {
            notify({ type: "error", message: "Failed to update Auto Sync setting" });
        }
    }

    async function updateDarkMode(value) {
        try {
            const current = await getSetting("display");
            await setSetting("display", {
                ...current,
                darkMode: value
            });
            notify({ type: "success", message: `Dark Mode ${value ? 'enabled' : 'disabled'}` });
        } catch (err) {
            console.error(err);
            notify({ type: "error", message: "Failed to update Dark Mode setting" });
        }
    }
</script>


<div class="settings">
    <div class="setting-item">
        <p class="text-muted mt-md">Settings</p>
    </div>

    <div class="setting-item">
        <ManageCategories />
    </div>

    <div class="setting-item">
        <ToggleSwitch
            label="Auto Sync"
            checked={$syncSetting?.autoSync}
            on:change={(e) => updateAutoSync(e.detail)}
            disabled={!$syncSetting?.enabled}
        />
    </div>

    <div class="setting-item">
        <ToggleSwitch
            label="Dark Mode"
            checked={$displaySetting?.darkMode}
            on:change={(e) => updateDarkMode(e.detail)}
        />
    </div>
</div>


<style>
.settings {
    display: flex;
    flex-direction: column;
    margin-top: 0;
}

.setting-item {
    border-bottom: 1px solid var(--gray-200);
    padding: var(--space-lg);
    width: 100%;
}

.setting-item > * {
    width: 100%;
}
</style>
