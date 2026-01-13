<script>
    import { query } from "$app/server";
    import { getTransactionsFromGmail } from "$lib/import-tx";
    import { parseEmailBody } from "$lib/utils";

    let transactions = [];
    let loading = false;
    let error = "";

    let q = {
        from: "",
        subject: "Transaction Notification",
        afterDate: "2025-01-01"
    }

    async function loadTransactionsFromEmail() {
        loading = true;
        error = "";

        try {
            transactions = await getTransactionsFromGmail(q.from, q.subject, q.afterDate);
        } catch (e) {
            error = "Failed to load transactions from email: " + e.message;
        } finally {
            loading = false;
        }
    }

</script>

<div>
    <button on:click={loadTransactionsFromEmail} disabled={loading}>
        {loading ? 'Loading...' : 'Load Transactions from Email'}
    </button>
    {#if error}
        <p class="error">{error}</p>
    {/if}
    {#if transactions.length > 0}
        <h4>Imported Transactions:</h4>
        <ul>
            {#each transactions as tx}
                <li>{tx.sender} - {tx.date} - {tx.description} - {tx.amount}</li>
            {/each}
        </ul>
    {/if}
</div>