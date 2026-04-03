<script>
    import { onMount } from "svelte";
    import { runSync } from "$lib/sync/runSync";
    import { 
        editTransaction, 
        deleteTransaction, 
        // useTransactions, 
        useLazyTransactions
     } from "$lib/domains/transactions";
    import { useCategories } from "$lib/domains/categories";
    import { useSetting } from "$lib/domains/settings";
    import { notify } from "$lib/stores/notification.store";
    import { syncState } from "$lib/stores/sync.store";
    import { formatDateTime } from "$lib/utils";
    import TransactionRow from "./TransactionRow.svelte";

    const categories = useCategories();

    let editingTx = null;

    const lazyTransactions = useLazyTransactions();

    const sync = useSetting('sync');

    function onScroll(event) {
        const wrapper = event.target;
        if (
            wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 50 &&
            !$lazyTransactions.loading && $lazyTransactions.hasMore
        ) {
            lazyTransactions.loadMore();
        }
    }

    async function manualSync() {
        try {
            await runSync();
            notify({ type: "success", message: "✅Sync completed" });
        } catch (err) {
            console.error(err);
            notify({ type: "error", message: "⚠️ Sync failed" });
        }
    }


    async function handleDelete(tx) {
        if (!confirm(`Delete transaction: ${tx.description}`)) return;
        try {
            await deleteTransaction(tx.id);
            notify({type: "success", message: "✅Deleted"})
        } catch (err) {
            notify({ type: "error", message: "⚠️Delete failed."});
        }
    }

    function startEdit(tx) {
        editingTx = {...tx};
    }

    async function saveEdit() {
        if (!editingTx.transactionType || !editingTx.amount || !editingTx.category) {
            notify({ type: "warning", message: "TransactionType/Amount/Category cannot be empty" });
            return;
        }
        try {
            await editTransaction(editingTx.id, editingTx);
            notify({ type: "success", message: "✅Edited"});
            editingTx = null;
        } catch (e) {
            console.error("Edit Failed", e)
            notify({ type: "error", message: "❌Edit Failed"});
        }
    }

    function cancelEdit() {
        editingTx = null;
    }

</script>

<div class="card transactions-container">
    <div style="display: flex; gap: var(--space-md); align-items: center;">
        <h3 style="margin: 0;">Transactions</h3>

        {#if $sync?.enabled}
            <button class="sync-status" on:click={manualSync} disabled={$syncState.inProgress}>
                <span class="sync-dot" class:syncing={$syncState.inProgress}></span>
                <span>
                    {$syncState.inProgress
                        ? $syncState.message 
                        : `Last synced: ${formatDateTime(new Date($sync?.lastSync))}` }
                </span>
            </button>

            {#if $syncState.inProgress}
                <div class="progress-wrapper">
                    <div class="progress-bar">
                        <div
                            class="progress-fill"
                            style="width: {$syncState.progress?.percentage || 0}%"
                        ></div>
                    </div>

                    <div class="progress-meta">
                        <span>{$syncState.progress?.percentage || 0}%</span>
                        <span>{$syncState.progress?.current || 0} / {$syncState.progress?.total || 0}</span>
                        <span>{$syncState.phase}</span>
                    </div>
                </div>
            {/if}

        {/if}
    </div>
   
    <div class="table-wrapper" on:scroll={onScroll}>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Category</th>
                {#if $sync?.enabled}
                    <th>Synced</th>
                {/if}
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#if !$lazyTransactions.loading && $lazyTransactions.transactions.length === 0}
                <tr><td colspan="7">No transactions Found!</td></tr>
            {:else}
                {#each $lazyTransactions.transactions as tx (tx.id)}
                    <TransactionRow
                        {tx}
                        isEditing={editingTx?.id === tx.id}
                        editingTx={editingTx}
                        categories={$categories}
                        onEdit={() => startEdit(tx)}
                        onSave={saveEdit}
                        onCancel={cancelEdit}
                        onDelete={() => handleDelete(tx)}
                    />
                {/each}
            {/if}
            {#if $lazyTransactions?.loading && $lazyTransactions.transactions.length > 0}
                <tr><td colspan="7">Loading more transactions...</td></tr>
            {/if}
        </tbody>
    </table>
    </div>

   
</div>

<style>
.transactions-container {
    height: 100dvh;
    display: flex;
    flex-direction: column;
}


tbody td:nth-child(4) {
    text-align: right;
}

.sync-status {
        border: 1px solid var(--gray-200);
        background: var(--surface-2);
        padding: 0.4rem 0.75rem;
        border-radius: 999px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: var(--green-900);
        cursor: pointer;
        transition: background 0.2s ease, border-color 0.2s ease;
    }

.sync-status:hover:not(:disabled) {
    background: var(--green-100);
    border-color: var(--green-500);
}

.sync-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--green-500);
    box-shadow: 0 0 0 4px var(--green-100);
}

.sync-dot.syncing {
    background: var(--amber-500);
    box-shadow: 0 0 0 4px var(--amber-100);
}

.progress-wrapper {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background: var(--gray-200);
    border-radius: 999px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(
        90deg,
        var(--green-500),
        var(--green-700)
    );
    width: 0%;
    transition: width 0.3s ease;
    border-radius: inherit;
}

/* Optional: animated shimmer while syncing */
.progress-fill::after {
    content: "";
    display: block;
    height: 100%;
    width: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.4),
        transparent
    );
    animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

.progress-meta {
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    color: var(--gray-600);
}

.progress-meta span {
    display: flex;
    align-items: center;
}

.progress-meta span:not(:last-child)::after {
    content: "•";
    margin: 0 0.5rem;
    color: var(--gray-400);
}
</style>
