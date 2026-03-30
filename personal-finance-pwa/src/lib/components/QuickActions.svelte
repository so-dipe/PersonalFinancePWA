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

<section class="barchips quick-actions-card">
    <div class="card-body">
        <div class="quick-actions">
        {#if $quickActions.length === 0}
            <p class="text-muted">No quick actions yet.</p>
        {:else}
            {#each $quickActions as tx}
                <button class="quick-action-btn" on:click={() => handleSelect(tx)}>
                    <span class="qa-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </span>
                    <span class="qa-text">
                        <span class="qa-title">{tx.description}</span>
                        <!-- <span class="qa-meta">{tx.category} • {formatAmount(tx)}</span> -->
                        <span class="qa-meta">{tx.category}</span>
                    </span>
                </button>
            {/each}
        {/if}
        </div>
    </div>
</section>

<style>
     .barchips {
    padding: clamp(6px, 1vw, 5px);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    position: relative;
      background: var(--surface-2);
    border-style: dashed;
    box-shadow: none;
        margin-bottom: 20px;

}
    .card-body {
        padding-top: var(--space-sm);
    }

    .quick-actions-card {
        width: 100%;
        max-width: 100%;
    }

    .quick-actions {
        width: 100%;
        display: flex;
        flex-wrap: nowrap;
        gap: var(--space-sm);
        margin-bottom: var(--space-md);
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 0.25rem;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .quick-actions::-webkit-scrollbar {
        display: none;
    }

    .quick-action-btn {
        background: var(--surface-2);
        color: var(--green-900);
        border: 1px solid var(--gray-200);
        border-radius: 14px;
        padding: 0.65rem 0.8rem;
        font-size: 0.85rem;
        cursor: pointer;
        transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.65rem;
        text-align: left;
        min-width: 220px;
        flex: 0 0 auto;
    }

    .quick-action-btn:hover {
        background: var(--green-100);
        transform: translateY(-2px);
        box-shadow: var(--shadow-sm);
    }

    .qa-icon {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: white;
        border: 1px solid var(--gray-200);
        display: grid;
        place-items: center;
        color: var(--green-700);
        flex-shrink: 0;
    }

    .qa-icon svg {
        width: 16px;
        height: 16px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .qa-text {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
    }

    .qa-title {
        font-weight: 600;
        font-size: 0.9rem;
    }

    .qa-meta {
        font-size: 0.78rem;
        color: var(--text-muted);
    }

</style>

