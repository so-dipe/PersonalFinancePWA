<script>
    import ManageCategories from './ManageCategories.svelte';
    import ToggleSwitch from './ToggleSwitch.svelte';
    import { settings, saveSettings } from '$lib/settings/store';
    import { get } from 'svelte/store';
    import { useSetting, getSetting, setSetting } from '$lib/db';

    const syncSetting = useSetting("sync");
    const displaySetting = useSetting("display");

    async function updateAutoSync(value) {
        const current = await getSetting("sync");

        setSetting("sync", {
            ...current,
            autoSync: value
        });
    }

    async function updateDarkMode(value) {
        const current = await getSetting("display");

        setSetting("display", {
            ...current,
            darkMode: value
        })
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
