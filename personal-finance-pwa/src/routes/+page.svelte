<script>
    import { onMount } from 'svelte';
    import { db, addTransaction } from '$lib/db';
    import { liveQuery } from 'dexie';
    import { googleToken, initGoogleAuth, loadGoogleApi } from '$lib/google';
    import { microTaskSyncEntity, syncAll } from '$lib/sync';
    import TransactionForm from '$lib/components/TransactionForm.svelte';
    import Transactions from '$lib/components/Transactions.svelte';

    let openSection = 'form';

    function toggle(section) {
        openSection = openSection === section ? null : section;
    }

    async function bootstrapApp() {
        await loadGoogleApi();
        initGoogleAuth();
        try {
            await syncAll()
        } catch (err) {
            console.log("Silent Login or Syncing unavailable", err)
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