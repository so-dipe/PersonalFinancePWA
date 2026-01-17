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
        if (!editingTx.transactionType || !editingTx.amount || !existingTx.category) {
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

    $: filteredCategories = editingTx?.transactionType ? categories.filter((c) => c.transactionType === editingTx?.transactionType) : [];

</script>

<div class="card transactions-card">
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

<style>
    tbody td:nth-child(4) {
        text-align: right;
    }
</style>