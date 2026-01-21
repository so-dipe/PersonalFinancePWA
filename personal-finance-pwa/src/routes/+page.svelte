<script>
    import { onMount } from 'svelte';
    import { runSync } from '$lib/sync/runSync';
    import TransactionForm from '$lib/features/transactions/TransactionForm.svelte';
    import Transactions from '$lib/features/transactions/Transactions.svelte';
    import { useSetting } from '$lib/domains/settings';

    let openSection = 'form';

    const syncSetting = useSetting('sync');

    function toggle(section) {
        openSection = openSection === section ? null : section;
    }

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
    overflow-y: auto;
}

.error {
    background-color: var(--red-100);
    color: var(--red-700);
    margin-bottom: var(--space-lg);
    padding: var(--space-md);
    border-radius: var(--radius-sm);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.retry-btn {
    background: var(--green-700);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-weight: 600;
}

.retry-btn:hover {
    background: var(--green-800);
}

.info {
    background: var(--blue-100);
    color: var(--blue-800);
    padding: var(--space-md);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-lg);
}

@keyframes fadeIn {
    from {opacity: 0; transform: translateY(10px);}
    to {opacity: 1; transform: translateY(0);}
}
</style>