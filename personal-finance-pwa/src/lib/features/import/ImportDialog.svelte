<script>
    import { formatDate } from "$lib/utils";
    import { onMount } from "svelte";

    export let transactions = [];
    export let onCommit;
    export let onClose;

    export let dialog;

    onMount(() => {
        if (dialog) dialog.showModal();
    });

    function handleClose() {
        dialog.close();
        onClose?.();
    }

    $: readyCount = transactions.filter(t => t.status === 'ready').length
</script>

<dialog
    class="modal" 
    bind:this={dialog} 
    on:keydown={(e) => {
        if (e.key === 'Escape') {
            handleClose();
        }
    }}
>
    <div class="dialog-head">
        <h3>Import Transactions</h3>

        <p>
            {readyCount} ready
            {transactions.length - readyCount} blocked
        </p>
    </div>

    <div class="table-wrapper">
    <table>
        <thead>
            <tr>
                <th scope="col">Date</th>
                <th scope="col">Transaction Type</th>
                <th scope="col">Description</th>
                <th scope="col">Amount</th>
                <th scope="col">Category</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            {#each transactions as tx}
                <tr class:blocked={tx.status !== 'ready'}>
                    <td>{tx.date ? formatDate(tx.date) : 'Invalid date'}</td>
                    <td>{tx.transactionType}</td>
                    <td>{tx.description}</td>
                    <td>{tx.amount}</td>
                    <td>{tx.rawCategory}</td>
                    <td>{tx.status}</td>
                </tr>
            {/each}
        </tbody>
    </table>
    </div>

    <div class="actions">
        <button class="btn-secondary" on:click={handleClose}>
            Cancel
        </button>

        <button
            class="btn-primary"
            on:click={() => onCommit?.()}
            disabled={readyCount === 0}
            aria-disabled={readyCount === 0}
        >
            Import {readyCount}
        </button>
    </div>

</dialog>

<style>
    dialog {
        display: flex;
        flex-direction: column;

        border: none;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        background: var(--bg-card);
        color: var(--text-main);

        width: min(640px, 90vw);
        max-height: 90vh;

        padding: 0;
    }

    
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }

    .dialog-head {
        padding: var(--space-md);
        border-bottom: 1px solid var(--border-subtle);
        background: var(--bg-card);
    }

    thead th {
        position: sticky;
        top: 0;
        z-index: 1;

        background: var(--bg-card);
        border-bottom: 1px solid var(--border-subtle);
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;

        padding: var(--space-md);
        border-top: 1px solid var(--border-subtle);
        background: var(--bg-card);
    }

    .actions button {
        appearance: none;
        border-radius: var(--radius-sm);
        padding: 0.45rem 0.9rem;

        font-size: 0.875rem;
        font-weight: 600;

        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease, opacity 0.15s ease;
    }

    .btn-secondary {
        background: transparent;
        color: var(--text-muted);
        border: 1px solid var(--border-subtle);
    }

    .btn-secondary:hover {
        background: var(--bg-hover);
        color: var(--text-main);
    }

    .btn-primary {
        background: var(--green-700);
        color: white;
        border: none;
    }

    .btn-primary:hover:not(:disabled) {
        background: var(--green-900);
    }

    .actions button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .actions button:focus-visible {
        outline: 2px solid var(--blue-400);
        outline-offset: 2px;
    }
</style>