<script>
    import { getFrequentTransactions } from '$lib/domains/transactions';
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { formatAmount } from '$lib/utils';
    import { notify } from '$lib/stores/notification.store';
    import { readable } from 'svelte/store';

    const dispatch = createEventDispatcher();

    const quickActions = readable([], (set) => {
        const sub = getFrequentTransactions().subscribe({
            next: (txs) => set(txs),
            error: (e) => console.error(e)
        });
        return () => sub.unsubscribe();
    })

    function handleSelect(tx) {
        dispatch('prefill', tx);
    }
</script>

<div class="card">
    <p class="text-muted mt-md">Quick Actions</p>
    <div class="quick-actions">
        {#if $quickActions.length === 0}
            <p class="text-muted">No quick actions yet.</p>
        {:else}
            {#each $quickActions as tx}
                <button class="quick-action-btn" on:click={() => handleSelect(tx)}>
                    {tx.description} | {tx.category} | {formatAmount(tx)}
                </button>
            {/each}
        {/if}
    </div>
</div>

<style>
    .quick-actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm);
        margin-bottom: var(--space-md);
    }

    .quick-action-btn {
        background: var(--green-100);
        color: var(--green-900);
        border: 1px dashed var(--green-500);
        border-radius: var(--radius-sm);
        padding: 0.5rem 0.75rem;
        font-size: 0.85rem;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .quick-action-btn:hover {
        background: var(--green-200);
    }

</style>