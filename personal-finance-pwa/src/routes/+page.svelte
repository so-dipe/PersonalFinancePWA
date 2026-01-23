<script>
    import { onMount } from 'svelte';
    import { runSync } from '$lib/sync/runSync';
    import TransactionForm from '$lib/features/transactions/TransactionForm.svelte';
    import RecentTransactions from '$lib/features/transactions/RecentTransactions.svelte';
    import { useSetting } from '$lib/domains/settings';

    const syncSetting = useSetting('sync');

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

<main class="page">
    <div class="page-grid">
        <div class="card">
            <TransactionForm />
        </div>
        <div class="transactions-container">
            <RecentTransactions />
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
    overflow-y: auto;
}

@keyframes fadeIn {
    from {opacity: 0; transform: translateY(10px);}
    to {opacity: 1; transform: translateY(0);}
}
</style>