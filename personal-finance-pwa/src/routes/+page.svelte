<script>
    import { onMount } from 'svelte';
    import { loadGoogleApi } from '$lib/google';
    import { syncAll } from '$lib/sync/sync';
    import TransactionForm from '$lib/components/TransactionForm.svelte';
    import Transactions from '$lib/components/Transactions.svelte';
    import { loadSettings } from '$lib/settings/store';

    let openSection = 'form';

    function toggle(section) {
        openSection = openSection === section ? null : section;
    }

    async function bootstrapApp() {
        const loadedSettings = await loadSettings();
        await loadGoogleApi();

        if (!loadedSettings.sync.enabled) return;

        await loadGoogleApi();

        if (loadedSettings.sync.autoSync) {
            await syncAll();
        }
    }

    onMount(bootstrapApp);
</script>

<div class="page">
    <div class="page-grid">
        <div class="card">
            <TransactionForm />
        </div>
        <div class="mt-lg">
            <Transactions />
        </div>
    </div>
</div>

<style>
    .page {
        padding: var(--space-lg);
    }

    .page-grid {
        display: grid;
        gap: var(--space-lg);
    }

    @media (min-width: 768px) {
        .page-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>