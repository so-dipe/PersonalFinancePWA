<script>
    import { onMount } from "svelte";
    import { readable } from "svelte/store";
    import { liveQuery } from "dexie";
    import { db } from "$lib/db";
    import { formatDate, formatDateTime, formatAmount } from "$lib/utils";
    import { syncAll } from "$lib/sync/sync";
    import { useSetting } from "$lib/domains/settings";
    import { TRANSACTION_TYPE_LABELS, TRANSACTIONS_LIMIT } from "$lib/constants/constants";
    import { useRecentTransactions } from "$lib/domains/transactions";

    const recentTransactions = readable([], (set) => {
        const sub = useRecentTransactions(TRANSACTIONS_LIMIT).subscribe({
            next: set,
            error: console.error
        });
        return () => sub.unsubscribe();
    })

    const sync = useSetting('sync');

    function manualSync() {
        syncAll();
    }
</script>

<div class="card">
    <h3>
        Recent Transactions
        {#if $sync?.enabled}
        <small>
            (<button class="sync-status" on:click={manualSync}>
                Last synced: {formatDateTime(new Date($sync?.lastSync))}
            </button>)
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
                {#if $recentTransactions?.length === 0}
                    <tr><td colspan="5">No transactions found.</td></tr>
                {:else}
                    {#each $recentTransactions as tx}
                        <tr>
                            <td>{formatDate(tx.date)}</td>
                            <td>{TRANSACTION_TYPE_LABELS[tx.transactionType]}</td>
                            <td>{tx.description}</td>
                            <td class={tx.transactionType === "income" ? "amount-positive": "amount-negative"}>{formatAmount(tx)}</td>
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