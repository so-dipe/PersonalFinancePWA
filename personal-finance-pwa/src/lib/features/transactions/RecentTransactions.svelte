<script>
    import { onMount } from "svelte";
    import { readable } from "svelte/store";
    import { liveQuery } from "dexie";
    import { db } from "$lib/db";
    import { formatDate, formatDateTime, formatAmount } from "$lib/utils";
    import { runSync } from "$lib/sync/runSync";
    import { useSetting } from "$lib/domains/settings";
    import { TRANSACTION_TYPE_LABELS, TRANSACTIONS_LIMIT } from "$lib/constants/constants";
    import { useRecentTransactions } from "$lib/domains/transactions";

    let syncing = false;

    const recentTransactions = readable([], (set) => {
        const sub = useRecentTransactions(TRANSACTIONS_LIMIT).subscribe({
            next: set,
            error: console.error
        });
        return () => sub.unsubscribe();
    })

    const sync = useSetting('sync');

    async function manualSync() {
        try {
            syncing = true;
            await runSync();
        } catch (e) {
            console.error("Sync Failed!", e)
        } finally {
            syncing = false;
        }
    }
</script>

<section class="card transactions-card">
    <header class="card-header">
        <div>
            <h3>Recent Transactions</h3>
            <p class="text-muted">Latest activity across your accounts</p>
        </div>
        {#if $sync?.enabled}
            <button class="sync-status" on:click={manualSync} disabled={syncing}>
                <span class="sync-dot" class:syncing={syncing}></span>
                <span>{syncing ? "Syncing..." : `Last synced: ${formatDateTime(new Date($sync?.lastSync))}`}</span>
            </button>
        {/if}
    </header>
    <div class="card-body">
        <div class="table-wrapper">
    <table class="transactions-table">
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
                <tr><td colspan="6">Loading...</td></tr>
            {:else}
                {#if $recentTransactions?.length === 0}
                    <tr><td colspan="6">No transactions found.</td></tr>
                {:else}
                    {#each $recentTransactions as tx}
                        <tr>
                            <td>{formatDate(tx.date)}</td>
                            <td>
                                <span class="type-pill" class:income={tx.transactionType === "income"} class:expense={tx.transactionType !== "income"}>
                                    {TRANSACTION_TYPE_LABELS[tx.transactionType]}
                                </span>
                            </td>
                            <td>{tx.description}</td>
                            <td class={tx.transactionType === "income" ? "amount-positive": "amount-negative"}>{formatAmount(tx)}</td>
                            <td>{tx.category}</td>
                            <td>
                                {#if $sync?.enabled}
                                    {#if tx.synced}
                                        <span class="sync-indicator synced" aria-label="Synced">
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                    {:else}
                                        <span class="sync-indicator pending" aria-label="Pending sync">
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M4 12a8 8 0 0 1 14-5M20 12a8 8 0 0 1-14 5" />
                                            </svg>
                                        </span>
                                    {/if}
                                {/if}
                            </td>
                        </tr>
                    {/each}
                {/if}
            {/if}
        </tbody>
    </table>
        </div>
    </div>
</section>

<style>
    .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        flex-wrap: wrap;
        margin-bottom: var(--space-md);
    }

    .card-header h3 {
        margin: 0;
    }

    .card-header p {
        margin: 0.25rem 0 0;
        font-size: 0.85rem;
    }

    .card-body {
        border-top: 1px solid var(--gray-200);
        padding-top: var(--space-md);
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

    .type-pill {
        display: inline-flex;
        align-items: center;
        padding: 0.15rem 0.6rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        background: var(--green-100);
        color: var(--green-900);
    }

    .type-pill.expense {
        background: var(--red-100);
        color: var(--red-700);
    }

    tbody td:nth-child(4) {
        text-align: right;
    }

    .amount-positive {
        color: var(--green-700);
        font-weight: 600;
    }

    .amount-negative {
        color: var(--red-700);
        font-weight: 600;
    }

    .sync-indicator {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        border: 1px solid var(--gray-200);
        background: var(--surface-1);
    }

    .sync-indicator svg {
        width: 16px;
        height: 16px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .sync-indicator.synced {
        color: var(--green-700);
        border-color: var(--green-500);
        background: var(--green-100);
    }

    .sync-indicator.pending {
        color: var(--amber-700);
        border-color: var(--amber-500);
        background: var(--amber-100);
    }

    @media (max-width: 720px) {
        .transactions-table thead {
            display: none;
        }

        .transactions-table,
        .transactions-table tbody,
        .transactions-table tr,
        .transactions-table td {
            display: block;
            width: 100%;
        }

        .transactions-table tr {
            background: var(--surface-2);
            border: 1px solid var(--gray-200);
            border-radius: 16px;
            padding: var(--space-sm);
            margin-bottom: var(--space-sm);
        }

        .transactions-table td {
            border: none;
            padding: 0.35rem 0;
            display: flex;
            justify-content: space-between;
            gap: var(--space-md);
        }

        .transactions-table td::before {
            font-weight: 600;
            color: var(--text-muted);
        }

        .transactions-table td:nth-child(1)::before {
            content: "Date";
        }

        .transactions-table td:nth-child(2)::before {
            content: "Type";
        }

        .transactions-table td:nth-child(3)::before {
            content: "Description";
        }

        .transactions-table td:nth-child(4)::before {
            content: "Amount";
        }

        .transactions-table td:nth-child(5)::before {
            content: "Category";
        }

        .transactions-table td:nth-child(6)::before {
            content: "Sync";
        }
    }
</style>
