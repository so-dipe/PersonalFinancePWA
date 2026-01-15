<script>
    import ManageCategories from './ManageCategories.svelte';
    import ToggleSwitch from './ToggleSwitch.svelte';
    import { settings, saveSettings } from '$lib/settings/store';
    import { get } from 'svelte/store';

    function updateAutoSync(value) {
        const current = get(settings);

        saveSettings({
            ...current,
            sync: {
                ...current.sync,
                autoSync: value
            }
        })
    }

    function updateDarkMode(value) {
        const current = get(settings);

        saveSettings({
            ...current,
            display: {
                ...current.display,
                darkMode: value
            }
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
            checked={$settings.sync?.autoSync}
            on:change={(e) => updateAutoSync(e.detail)}
            disabled={!$settings.sync?.enabled}
        />
    </div>


    <div class="setting-item">
        <ToggleSwitch
            label="Dark Mode"
            checked={$settings.display?.darkMode}
            on:change={(e) => updateDarkMode(e.detail)}
        />
    </div>
</div>


<style>
.settings {
    display: flex;
    flex-direction: column;
    margin-top: 2rem;
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
