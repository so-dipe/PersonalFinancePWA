<script>
    import { getTransactionsFromGmail } from "$lib/import-tx";
    import { runImportPipeline } from "$lib/import/pipeline";
    import Accordion from "./Accordion.svelte";
    import ImportDialog from "./ImportDialog.svelte";

    let transactions = [];
    let loading = false;
    let error = "";

    let showDialog = false;

    let q = {
        from: "",
        subject: "Transaction Notification",
        afterDate: "2025-01-01"
    }

    async function loadTransactionsFromEmail() {
        loading = true;
        error = "";

        try {
            const emails = await getTransactionsFromGmail(q.from, q.subject, q.afterDate);
            const raw = emails.map(e => ({
                date: e.date,
                transactionType: e.transactionType ?? 'expense',
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
            error = e.message;
        } finally {
            loading = false;
        }
    }

    function commitImport() {
        console.log("Ready to commit!")
    }

</script>

<Accordion title="Import from Email">
    <div class="email-form">
        <label>
            Sender
            <input bind:value={q.from} placeholder="e.g. alerts@bank.com" />
        </label>
        <label>
            Subject contains
            <input bind:value={q.subject} />
        </label>
        <label>
            After date
            <input type="date" bind:value={q.afterDate} />
        </label>
        <button class="primary" on:click={loadTransactionsFromEmail} disabled={loading}>
            {loading ? 'Loading...' : 'Load Transactions'}
        </button>
        {#if error}
            <p class="error">{error}</p>
        {/if}
    </div>
</Accordion>
{#if showDialog}
    <ImportDialog
        {transactions}
        onClose={() => (showDialog = false)}
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