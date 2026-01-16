<script>
    import { onMount } from 'svelte';
    import { loadGoogleApi } from '$lib/google';
    import { syncAll } from '$lib/sync/sync';
    import TransactionForm from '$lib/components/TransactionForm.svelte';
    import Transactions from '$lib/components/Transactions.svelte';
    import { loadSettings } from '$lib/settings/store';
    import { loadDefaultSettings } from '$lib/db';

    let openSection = 'form';
    let bootstrapError = null;

    function toggle(section) {
        openSection = openSection === section ? null : section;
    }

    async function bootstrapApp() {
        try {
            // await loadDefaultSettings();
            const loadedSettings = await loadSettings();
            await loadGoogleApi();

            if (!loadedSettings.sync.enabled) return;

            if (loadedSettings.sync.autoSync) {
                await syncAll();
            }
        } catch (err) {
            console.error("Bootstrap failed:", err)
            bootstrapError = "Failed to initialize app. Please refresh.";
        }
    }

    onMount(bootstrapApp);
</script>

<main class="page">
    {#if bootstrapError}
        <div class="card error">{bootstrapError}</div>
    {/if}
    <div class="page-grid">
        <div class="card">
            <TransactionForm />
        </div>
        <div class="transactions-container">
            <Transactions />
        </div>
    </div>
</main>

<style>
    .page {
        padding: var(--space-lg);
        animation: fadeIn 0.3s ease;
    }

    .page-grid {
        display: grid;
        gap: var(--space-lg);
    }

    @media (min-width: 768px) {
        .page-grid {
            grid-template-columns: repeat(2, 1fr);
            align-items: start;
        }
    }

    .transactions-container {
        padding-top: var(--space-lg);
        /* max-height: 400px; */
        overflow-y: auto;
    }

    .error {
        background-color: var(--red-100);
        color: var(--red-700);
        margin-bottom: var(--space-lg);
        padding: var(--space-md);
        border-radius: var(--radius-sm);
    }

    @keyframes fadeIn {
        from {opacity: 0; transform: translateY(10px);}
        to {opacity: 1; transform: translateY(0);}
    }
</style>