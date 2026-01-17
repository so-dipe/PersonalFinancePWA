<script>
    import { addTransactionsBulk } from "$lib/db";
    import { getTransactionsFromGmail } from "$lib/import-tx";
    import { runImportPipeline } from "$lib/import/pipeline";
    import Accordion from "./Accordion.svelte";
    import ImportDialog from "./ImportDialog.svelte";
    import { notify } from "$lib/notification/store";

    let transactions = [];
    let loading = false;
    let error = "";

    let showDialog = false;

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
</script>

<Accordion title="Import from Email">
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
        <button class="primary" on:click={loadTransactionsFromEmail} disabled={loading}>
            {loading ? 'Loading...' : 'Load Transactions'}
        </button>
    </div>
</Accordion>
{#if showDialog}
    <ImportDialog
        {transactions}
        onClose={() => {showDialog = false; transactions = []}}
        onCommit={commitImport}
    />
{/if}

<style>
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
</style>