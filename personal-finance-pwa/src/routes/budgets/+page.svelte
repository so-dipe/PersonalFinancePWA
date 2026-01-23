<script>
    import { onMount } from 'svelte';
    import { runSync } from '$lib/sync/runSync';
    import { useSetting } from '$lib/domains/settings';
    import ManageBudget from '$lib/features/budgets/ManageBudget.svelte';

    let openSection = 'form';

    const syncSetting = useSetting('sync');
</script>

<div class="page">
    <div class="page-grid">
        <div class="card">
            <ManageBudget />
        </div>
    </div>
</div>

<style>
.page {
    padding: var(--space-lg);
    animation: fadeIn 0.3s ease;
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}
</style>