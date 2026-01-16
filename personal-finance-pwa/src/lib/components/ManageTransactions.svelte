<script>
    import { onMount } from "svelte";
    import { readable } from "svelte/store";
    import { liveQuery } from "dexie";
    import { formatDate, formatDateTime, formatFinancial } from "$lib/utils";
    import { syncAll } from "$lib/sync/sync";
    import { db, deleteTransaction, editTransaction, useSetting } from "$lib/db";
    import { notify } from "$lib/notification/store";

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
                    .filter((tx) => tx.deleted === 0)
                    .toArray()
            ).subscribe({
                next: set,
                error: console.error
            });
            return () => sub.unsubscribe();
        });

        let cats = await db.categories.where("deleted").equals(0).toArray();

        if (!cats.length) {
            await loadDefaultCategories();
            cats = await db.categories.toArray();
        }
        categories = cats;

    });

    async function manualSync() {
        await syncAll();
    }

    async function handleDelete(tx) {
        if (!confirm(`Delete transaction: ${tx.description}`)) return;
        try {
            await deleteTransaction(tx.id);
            notify("✅Deleted")
        } catch (err) {
            console.error("Delete failed", err);
            notify({ type: "error", message: "⚠️Delete failed."});
        }
    }

    function startEdit(tx) {
        editingTx = {...tx};
    }

    async function saveEdit() {
        try {
            await editTransaction(editingTx.id, editingTx);
            notify({ type: "success", message: "✅Edited"});
            editingTx = null;
        } catch (err) {
            console.log("Edit Failed", err);
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
            {#if !recentTransactions}
                <tr><td colspan="7">Loading...</td></tr>
            {:else if $recentTransactions.length === 0}
                <tr><td colspan="7">No transactions found.</td></tr>
            {:else}
                {#each $recentTransactions as tx (tx.id)}
                    <tr class={editingTx?.id === tx.id ? 'editing' : ''}>
                        <td>
                            {#if editingTx?.id === tx.id}
                                <input type="date" bind:value={editingTx.date} />
                            {:else}
                                {formatDate(tx.date)}
                            {/if}
                        </td>


                        <td>
                            {#if editingTx?.id === tx.id}
                                <select bind:value={editingTx.transactionType}>
                                    <option value="Income">Income</option>
                                    <option value="Expense">Expense</option>
                                </select>
                            {:else}
                                {tx.transactionType}
                            {/if}
                        </td>


                        <td>
                            {#if editingTx?.id === tx.id}
                                <input type="text" bind:value={editingTx.description} />
                            {:else}
                                {tx.description}
                            {/if}
                        </td>


                        <td>
                            {#if editingTx?.id === tx.id}
                                <input type="number" step="0.01" min="0" bind:value={editingTx.amount} />
                            {:else}
                                <span class={tx.transactionType === "Income" ? "amount-positive" : "amount-negative"}>
                                    {formatFinancial(tx.amount, tx.transactionType === "Expense")}
                                </span>
                            {/if}
                        </td>


                        <td>
                            {#if editingTx?.id === tx.id}
                                <select bind:value={editingTx.category}>
                                    {#each categories as cat}
                                        <option value={cat.name}>{cat.name}</option>
                                    {/each}
                                </select>
                            {:else}
                                {tx.category}
                            {/if}
                        </td>


                        <td>{tx.synced ? "✅" : "☁️"}</td>


                        <td>
                            {#if editingTx?.id === tx.id}
                                <button class="btn-save" on:click={saveEdit}>Save</button>
                                <button class="btn-cancel" on:click={cancelEdit}>Cancel</button>
                            {:else}
                                <button class="btn-edit" on:click={() => startEdit(tx)}>Edit</button>
                                <button class="btn-delete" on:click={() => handleDelete(tx)}>Delete</button>
                            {/if}
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>

<style>
    tbody td:nth-child(4) {
        text-align: right;
    }

    .amount-positive {
        color: var(--green-700);
    }

    .amount-negative {
        color: var(--red-700);
    }
</style>