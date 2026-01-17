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

    // $: if (dialog) {
    //     dialog.showModal();
    // }

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
                    <td>{tx.category}</td>
                    <td>{tx.status}</td>
                </tr>
            {/each}
        </tbody>
    </table>

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

        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;

        padding-top: var(--space-sm);
        padding-bottom: var(--space-sm);

        background: var(--bg-card);
        border-top: 1px solid var(--border-subtle);
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
        background: var(--green-800);
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