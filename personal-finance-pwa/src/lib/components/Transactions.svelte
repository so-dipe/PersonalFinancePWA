<script>
    import { onMount } from "svelte";
    import { readable } from "svelte/store";
    import { liveQuery } from "dexie";
    import { db, useSetting } from "$lib/db";
    import { formatDate, formatDateTime, formatFinancial } from "$lib/utils";
    import { syncAll } from "$lib/sync/sync";

    let recentTransactions;

    const sync = useSetting('sync');

    onMount(() => {
        recentTransactions = readable([], (set) => {
            const sub = liveQuery(() =>
                db.transactions
                    .orderBy("createdAt")
                    .reverse()
                    .filter((tx) => tx.deleted === 0)
                    .limit(100)
                    .toArray()
            ).subscribe({
                next: set,
                error: console.error
            });
            return () => sub.unsubscribe();
        })
    });

    function manualSync() {
        syncAll();
    }
</script>

<div class="card">
    <h3>
        Recent Transactions
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
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#if !recentTransactions}
                <tr><td colspan="5">Loading...</td></tr>
            {:else}
                {#if $recentTransactions.length === 0}
                    <tr><td colspan="5">No transactions found.</td></tr>
                {:else}
                    {#each $recentTransactions as tx}
                        <tr>
                            <td>{formatDate(tx.date)}</td>
                            <td>{tx.transactionType}</td>
                            <td>{tx.description}</td>
                            <td class={tx.transactionType === "Income" ? "amount-positive": "amount-negative"}>{formatFinancial(tx.amount, tx.transactionType === "Expense" ? true: false)}</td>
                            <td>{tx.category}</td>
                            <td>{tx.synced ? "✅" : "☁️"}</td>
                        </tr>
                    {/each}
                {/if}
            {/if}
        </tbody>
    </table>
    </div>
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