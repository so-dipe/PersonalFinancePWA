<script>
    import { addTransaction, getFrequentTransactions } from '$lib/db';
    import { onMount, createEventDispatcher } from 'svelte';
    import { formatAmount } from '$lib/utils';
    // import { microTaskSyncEntity } from '$lib/sync';

    const dispatch = createEventDispatcher();

    let quickActions = [];

    async function selectQuickAction(tx) {
        const date = new Date().toISOString().slice(0, 10);
        const transactionType = tx.transactionType;
        const description = tx.description;
        const amount = tx.amount;
        const category = tx.category;

        // await addTransaction(date, transactionType, description, amount, category);
        // await microTaskSyncEntity('transactions');
    }
    
    onMount(async () => {
        const sub = (await getFrequentTransactions()).subscribe((txs) => {
            quickActions = txs;
        })
    }) 
</script>

<div class="card">
    <p class="text-muted mt-md">Quick Actions</p>
    <div class="quick-actions">
        {#if quickActions.length === 0}
            <p class="text-muted">No quick actions yet.</p>
        {:else}
            {#each quickActions as tx}
                <button class="quick-action-btn" on:click={() => dispatch('prefill', tx)}>
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