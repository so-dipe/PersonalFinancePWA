<script>
    import { onMount } from "svelte";
    import { readable } from "svelte/store";
    import { liveQuery } from "dexie";
    import { formatDate, formatDateTime, formatFinancial } from "$lib/utils";
    import { runSync } from "$lib/sync/runSync";
    import { db } from "$lib/db";
    import { editTransaction, deleteTransaction, useTransactions, useLazyTransactions } from "$lib/domains/transactions";
    import { useCategories } from "$lib/domains/categories";
    import { useSetting } from "$lib/domains/settings";
    import { notify } from "$lib/stores/notification.store";
    import { syncState } from "$lib/stores/sync.store";
    import TransactionRow from "./TransactionRow.svelte";

    const categories = useCategories();
    let filteredCategories;

    const lazyTransactions = useLazyTransactions();
    
    let observer;

    onMount(() => {
        lazyTransactions.loadMore();
    });

    function onScroll(event) {
        const wrapper = event.target;
        if (wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 50) {
            $lazyTransactions.hasMore && lazyTransactions.loadMore();
        }
    }

    let editingTx = null;

    const sync = useSetting('sync');

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

    async function exportCSV() {
        try {
            const [txs, activeCategories] = await Promise.all([
                db.transactions
                    .where('deleted')
                    .equals(0)
                    .sortBy('createdAt'),
                categories?.length ? Promise.resolve(categories) : getActiveCategories()
            ]);

            if (!txs.length) {
                notify({ type: "warning", message: "No transactions to export." });
                return;
            }

            const categoryMap = Object.fromEntries(
                (activeCategories ?? []).map(c => [c.uuid, c.name])
            );

            const header = ['Date', 'Type', 'Description', 'Amount', 'Category', 'Synced'];

            const toCsvValue = (value) => {
                if (value === null || value === undefined) return '';
                const str = String(value);
                return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
            };

            const rows = txs.map(tx => {
                const dateValue = typeof tx.date === 'string'
                    ? tx.date
                    : new Date(tx.date).toISOString().slice(0, 10);
                const categoryName = categoryMap[tx.categoryUuid] ?? 'Unknown';
                return [
                    dateValue,
                    tx.transactionType,
                    tx.description ?? '',
                    tx.amount ?? '',
                    categoryName,
                    tx.synced ? 'Yes' : 'No'
                ].map(toCsvValue);
            });

            const csvContent = [header, ...rows]
                .map(r => r.join(','))
                .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `transactions-${new Date().toISOString().slice(0,10)}.csv`);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            notify({ type: "success", message: "CSV exported!" });
        } catch (err) {
            console.error("CSV export failed", err);
            notify({ type: "error", message: "CSV export failed." });
        }
    }

</script>

<div class="card transactions-container">
    <div style="display: flex; flex-direction: row; justify-content: space-between;">
 <h3>
        Transactions
        {#if $sync?.enabled}
            <small>
                (<a class="sync-status" on:click={manualSync}>
                    {$syncState.inProgress ? $syncState.message : `Last synced: ${formatDateTime(new Date($sync?.lastSync))}` }
                    <!-- Last synced: {formatDateTime(new Date($sync?.lastSync))} -->
                </a>)
            </small>
        {/if}
    </h3>
 <div class="export-footer">
        <button class="export-btn" on:click={exportCSV}>
            Export CSV
        </button>
    </div>
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
            {#if !$lazyTransactions}
                <tr><td colspan="7">Loading...</td></tr>
            {:else if $lazyTransactions.length === 0}
                <tr><td colspan="7">No transactions found.</td></tr>
            {:else}
                {#each $lazyTransactions.transactions as tx (tx.id)}
                    <TransactionRow
                        {tx}
                        isEditing={editingTx?.id === tx.id}
                        editingTx={editingTx}
                        {categories}
                        onEdit={() => startEdit(tx)}
                        onSave={saveEdit}
                        onCancel={cancelEdit}
                        onDelete={() => handleDelete(tx)}
                    />
                {/each}
            {/if}
            {#if $lazyTransactions?.loading}
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

.export-footer {
    position: sticky;
    bottom: 0;
    background: white;
    padding: 0.5rem;
    text-align: right;
    border-top: 1px solid #eee;
}

.export-btn {
    background: var(--green-900);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-weight: 600;
}
</style>
