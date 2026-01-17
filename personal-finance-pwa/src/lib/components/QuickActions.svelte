<script>
    import { addTransaction, getFrequentTransactions } from '$lib/db';
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { formatAmount } from '$lib/utils';
    import { notify } from '$lib/notification/store';

    const dispatch = createEventDispatcher();

    let quickActions = [];
    let loading = true;
    let error = "";

    let subscription;

    async function loadQuickActions() {
        try {
            const txObservable = await getFrequentTransactions();
            subscription = txObservable.subscribe({
                next: (txs) => {
                    quickActions = txs;
                    loading = false;
                },
                error: (err) => {
                    console.error(err);
                    error = "Failed to load quick actions.";
                    notify({ type: "error", message: error });
                    loading = false;
                }
            });
        } catch (err) {
            console.error(err);
            error = "Failed to load quick actions.";
            notify({ type: "error", message: error });
            loading = false;
        }
    }

    function handleSelect(tx) {
        dispatch('prefill', tx);
    }
    
    onMount(async () => {
        loadQuickActions();
    });

    onDestroy(() => {
        subscription?.unsubscribe?.();
    });
</script>

<div class="card">
    <p class="text-muted mt-md">Quick Actions</p>
    <div class="quick-actions">
        {#if quickActions.length === 0}
            <p class="text-muted">No quick actions yet.</p>
        {:else}
            {#each quickActions as tx}
                <button class="quick-action-btn" on:click={() => handleSelect(tx)}>
                    {tx.description} - {tx.category} - {formatAmount(tx.amount)}
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