<script>
    import { onMount } from 'svelte';
    import { runSync } from '$lib/sync/runSync';
    import { useSetting } from '$lib/domains/settings';
    import ManageBudget from '$lib/features/budgets/ManageBudget.svelte';

    let openSection = 'form';

    const syncSetting = useSetting('sync');
</script>

<main class="page">
    <div class="page-grid">
        <div class="card">
            <ManageBudget />
        </div>
        <div class="card">
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

@keyframes fadeIn {
    from {opacity: 0; transform: translateY(10px);}
    to {opacity: 1; transform: translateY(0);}
}
</style>