<script>
    import { onMount } from 'svelte';
    import { runSync } from '$lib/sync/runSync';
    import TransactionForm from '$lib/features/transactions/TransactionForm.svelte';
    import RecentTransactions from '$lib/features/transactions/RecentTransactions.svelte';
    import { useSetting } from '$lib/domains/settings';

    const syncSetting = useSetting('sync');
    let showForm = true;

    async function bootstrapApp() {
        try {
            if (!syncSetting.enabled) return;
            if (syncSetting.autoSync) {
                await runSync();
            }
        } catch (err) {
            console.error("Bootstrap failed:", err)
        }
    }
    onMount(bootstrapApp);
</script>

<main class="dashboard">
    <div class="dashboard-grid">
        {#if showForm}
            <section class="dashboard-column">
                <div class="card">
                    <TransactionForm />
                </div>
            </section>
        {/if}
    </div>
</main>

<style>


.dashboard {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}





.dashboard-grid {
    display: grid;
    gap: var(--space-lg);
    grid-template-columns: 1fr;
}


@media (min-width: 900px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
        align-items: start;
    }
}

@keyframes fadeIn {
    from {opacity: 0; transform: translateY(10px);}
    to {opacity: 1; transform: translateY(0);}
}
</style>
