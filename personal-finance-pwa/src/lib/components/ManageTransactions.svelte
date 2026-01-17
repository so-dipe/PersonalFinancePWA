<script>
    import { onMount } from "svelte";
    import { readable } from "svelte/store";
    import { liveQuery } from "dexie";
    import { formatDate, formatDateTime, formatFinancial } from "$lib/utils";
    import { syncAll } from "$lib/sync/sync";
    import { db, deleteTransaction, editTransaction, useSetting } from "$lib/db";
    import { notify } from "$lib/notification/store";
    import TransactionRow from "./TransactionRow.svelte";
    
    let recentTransactions;

    let categories;
    let filteredCategories;

    let editingTx = null;

    const sync = useSetting('sync');

    onMount(async () => {
        recentTransactions = readable([], (set) => {
            const sub = liveQuery(() =>
                db.transactions
                    .orderBy("createdAt")
                    .reverse()
                    .filter(tx => tx.deleted === 0)
                    .toArray()
            ).subscribe({
                next: set,
                error: (err) => {
                    console.error(err);
                    notify({ type: "error", message: "Failed to load transactions." });
                }
            });
            return () => sub.unsubscribe();
        });

        try {
            let cats = await db.categories.where("deleted").equals(0).toArray();
            if (!cats.length) {
                await loadDefaultCategories();
                cats = await db.categories.where("deleted").equals(0).toArray();
            }
            categories = cats;
        } catch (err) {
            console.error(err);
            notify({ type: "error", message: "Failed to load categories." });
        }
    });

    async function manualSync() {
        try {
            await syncAll();
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
        } catch (err) {
            notify({ type: "error", message: "❌Edit Failed"});
        }
    }

    function cancelEdit() {
        editingTx = null;
    }

    async function exportCSV() {
        let txs = await db.transactions
            .where('deleted').equals(0)
            .sortBy('createdAt');

        if (!txs.length) {
            notify({ type: "warning", message: "No transactions to export." });
            return;
        }

        const header = ['Date', 'Type', 'Description', 'Amount', 'Category', 'Synced'];

        const rows = txs.map(tx => [
            tx.date,
            tx.transactionType,
            `"${tx.description.replace(/"/g, '""')}"`,
            tx.amount,
            tx.category ?? '',
            tx.synced ? 'Yes' : 'No'
        ]);

        const csvContent = [header, ...rows]
            .map(r => r.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions-${new Date().toISOString().slice(0,10)}.csv`);
        link.click();

        notify({ type: "success", message: "CSV exported!" });
    }

    $: filteredCategories = editingTx?.transactionType ? categories.filter((c) => c.transactionType === editingTx?.transactionType) : [];

</script>

<div class="card transactions-container">
    <h3>
        Transactions
        {#if $sync?.enabled}
            <small>
                (<a class="sync-status" on:click={manualSync}>
                    Last synced: {formatDateTime(new Date($sync?.lastSync))}
                </a>)
            </small>
        {/if}
    </h3>

    <div class="table-wrapper">
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Synced</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#if recentTransactions === undefined}
                <tr><td colspan="7">Loading...</td></tr>
            {:else if $recentTransactions.length === 0}
                <tr><td colspan="7">No transactions found.</td></tr>
            {:else}
                {#each $recentTransactions as tx (tx.id)}
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
        </tbody>
    </table>
    </div>

    <div class="export-footer">
        <button class="export-btn" on:click={exportCSV}>
            Export CSV
        </button>
    </div>
</div>

<style>
.transactions-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
}


tbody td:nth-child(4) {
    text-align: right;
}

.export-footer {
    position: sticky;
    bottom: 0;
    background: white; /* match card background */
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