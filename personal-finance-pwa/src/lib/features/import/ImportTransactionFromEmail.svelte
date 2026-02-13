<script>
    import { addTransactionBulk } from "$lib/domains/transactions";
    import { getTransactionsFromGmail } from "./gmail";
    import { runImportPipeline } from "$lib/features/import/pipeline";
    import ImportDialog from "./ImportDialog.svelte";
    import { notify } from "$lib/stores/notification.store";
    import { tick } from "svelte";
    import { Mail } from "lucide-svelte";

    let transactions = [];
    let loading = false;
    let error = "";

    let showDialog = false;
    let showModal = false;
    let dialog;

    const after = new Date();
    after.setDate(after.getDate() - 30);

    let q = {
        from: "",
        subject: "Transaction Notification",
        afterDate: after.toISOString().slice(0, 10)
    }

    async function loadTransactionsFromEmail() {
        loading = true;
        error = "";

        try {
            const emails = await getTransactionsFromGmail(q.from, q.subject, q.afterDate);
            const raw = emails.map(e => ({
                date: e.date,
                transactionType: e.transactionType ?? 'Expense',
                description: e.description,
                amount: e.amount,
                source: 'email',
                sourceMeta: {
                    sender: e.sender,
                    messageId: e.id
                }
            }));
            transactions = await runImportPipeline(raw);
            showDialog = true;
        } catch (e) {
            notify({type: "error", message: e.message || "Failed to load transactions from email."});
        } finally {
            loading = false;
        }
    }

    function commitImport() {
        try {
            const readyTransactions = transactions.filter(
                (tx) => tx.status === "ready"
            );
            addTransactionsBulk(readyTransactions);
            notify({ type: "success", message: `🎉Yay...Successfully imported ${readyTransactions.length} transactions!`});
            showDialog = false;
        } catch (err) {
            notify({ type: "error", message: "❌Oops...Import failed. Please try again"});
        }
    }

    async function openModal() {
        showModal = true;
        await tick();
        if (dialog && !dialog.open) dialog.showModal();
    }

    function closeModal() {
        showModal = false;
        if (dialog) dialog.close();
    }
</script>

<button class="import-trigger" type="button" on:click={openModal}>
    <span class="accordion-title">
        <span class="icon" aria-hidden="true">
            <Mail class="icon" />
        </span>
        Import from Email
    </span>
    <span class="chevron">▾</span>
</button>

{#if showModal}
    <dialog
        class="import-modal"
        bind:this={dialog}
        on:close={() => (showModal = false)}
        on:keydown={(e) => {
            if (e.key === "Escape") closeModal();
        }}
    >
        <div class="modal-head">
            <h3>Import from Email</h3>
            <button class="icon-btn" type="button" on:click={closeModal} aria-label="Close">
                X
            </button>
        </div>
        <div class="modal-body">
            <div class="email-form">
                <label for="fromInput">
                    Sender
                    <input id="fromInput" bind:value={q.from} placeholder="e.g. alerts@bank.com" />
                </label>

                <label for="subjectInput">
                    Subject contains
                    <input id="subjectInput" bind:value={q.subject} />
                </label>

                <label for="afterDateInput">
                    After date
                    <input id="afterDateInput" type="date" bind:value={q.afterDate} />
                </label>
            </div>
        </div>
        <div class="modal-actions">
            <button class="ghost" type="button" on:click={closeModal}>Cancel</button>
            <button class="primary" type="button" on:click={loadTransactionsFromEmail} disabled={loading}>
                {loading ? "Loading..." : "Load Transactions"}
            </button>
        </div>
    </dialog>
{/if}


{#if showDialog}
    <ImportDialog
        {transactions}
        onClose={() => {showDialog = false; transactions = []}}
        onCommit={commitImport}
    />
{/if}

<style>
   .accordion-title {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
}



.icon {
  width: 22px;
  height: 22px;

  display: grid;
  place-items: center;
  color: var(--green-700);
}
    .email-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }

    .email-form label {
        display: flex;
        flex-direction: column;
        font-size: 0.85rem;
        gap: 0.25rem;
    }

    button {
        border: none;
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    button.primary {
        background: var(--green-500);
        color: white;
    }
    
    button.primary:hover {
        background: var(--green-700);
    }

    .import-trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-sm);
        background: var(--bg-card);
    }

    .chevron {
        font-size: 0.9rem;
        opacity: 0.7;
    }

    dialog.import-modal {
        border: none;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        background: var(--bg-card);
        color: var(--text-main);
        width: min(560px, 92vw);
        max-height: 90vh;
        padding: 0;
    }

    dialog.import-modal::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }

    .modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-md);
        border-bottom: 1px solid var(--gray-200);
    }

    .modal-body {
        padding: var(--space-md);
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: var(--space-md);
        border-top: 1px solid var(--gray-200);
        background: var(--bg-card);
    }

    .icon-btn {
        border: 1px solid var(--gray-200);
        background: var(--surface-2);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        padding: 0;
        display: grid;
        place-items: center;
        font-size: 0.9rem;
    }

    .ghost {
        background: transparent;
        border: 1px solid var(--gray-200);
        color: var(--text-main);
    }
</style>
