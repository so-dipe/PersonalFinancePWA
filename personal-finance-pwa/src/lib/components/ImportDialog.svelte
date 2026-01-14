<script>
    import { formatDate } from "$lib/utils";
    import { onMount } from "svelte";

    export let transactions = [];
    export let onCommit;
    export let onClose;

    export let dialog;

    $: if (dialog) {
        dialog.showModal();
    }

    function handleClose() {
        dialog.close();
        onClose?.();
    }

    $: readyCount = transactions.filter(t => t.status === 'ready').length
</script>

<dialog class="modal" bind:this={dialog} on:keydown={(e) => e.key === 'Escape' && onClose()}>
    <div class="dialog-head">
        <h3>Import Transactions</h3>

        <p>
            {readyCount} ready
            {transactions.length - readyCount} blocked
        </p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Transaction Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            {#each transactions as tx}
                <tr class:blocked={tx.status !== 'ready'}>
                    <td>{formatDate(tx.date)}</td>
                    <td>{tx.transactionType}</td>
                    <td>{tx.description}</td>
                    <td>{tx.amount}</td>
                    <td>{tx.category}</td>
                    <td>{tx.status}</td>
                </tr>
            {/each}
        </tbody>
    </table>

    <div class="actions">
        <button on:click={handleClose}>Close</button>
        <button on:click={onCommit} disabled={readyCount === 0}> Import {readyCount}</button>
    </div>
</dialog>

<style>
    dialog {
        border: none;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        background: var(--bg-card);
        color: var(--text-main);
        padding: var(--space-md);
        max-width: 640px;
        width: 90%;
        max-height: 90vh;
        overflow: auto;
        position: fixed;
        inset: 0;
        margin: auto;
    }
    
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }

    .dialog-head {
        position: sticky;
        top: 0;
        background: var(--bg-card);
    }

    table thead {
        position: sticky;
        top: 2;
        background: var(--bg-card);
    }

    .actions {
        position: sticky;
        bottom: 0;
        background: var(--bg-card);
    }
</style>