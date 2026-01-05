<script>
    import { onMount} from 'svelte';
    import { db, addTransaction } from '$lib/db';
    import { liveQuery } from 'dexie';
    import { ensureValidToken, googleToken, initGoogleAuth, login } from '$lib/drive';
    import { microTaskSyncEntity, syncAll } from '$lib/sync';

    onMount(async () => {
        initGoogleAuth();
        try {
            await syncAll()
        } catch (err) {
            console.log("Silent Login or Syncing unavailable", err)
        }
    })

    let date = new Date().toISOString().slice(0, 10);
    let transactionType = "";
    let description = "";
    let amount = "";
    let category = "";

    const recentTransactions = liveQuery(() => 
        db.transactions
            .orderBy('createdAt')
            .reverse()
            .filter(tx => tx.deleted === 0)
            .limit(100)
            .toArray()
    );

    async function handleSave() {
        if (!date || !transactionType || !description || !amount || !category) return;
        await addTransaction(date, transactionType, description, amount, category);
        await microTaskSyncEntity('transactions');
    }
</script>

<div>
    <h1>Income & Expenses</h1>
    <button on:click={syncAll}>
        {$googleToken ? 'Sync to Google Drive': 'Login to Sync to Google Drive'}
    </button>
    <div class="card">
        <input type="date" bind:value={date}>
        <select bind:value={transactionType}>
            <option>Income (+)</option>
            <option>Expense (-)</option>
        </select>
        <input type="text" bind:value={description}>
        <input type="number" bind:value={amount}>
        <select bind:value={category}>
            <option>Food</option>
            <option>Transportation</option>
        </select>
        <button on:click={handleSave}>Submit</button>
    </div>

    <div class="list">
        {#if $recentTransactions}
            {#each $recentTransactions as tx}
                <div class="item">
                    <span>{tx.date}</span>
                    <span>{tx.amount.toFixed(2)}</span>
                    <small>{tx.synced ? '✅' : '☁️'}</small>
                </div>
            {/each}
        {:else}
            <p>Loading Recent Transactions...</p>
        {/if}
    </div>
</div>

<style>
	.container { max-width: 400px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
	.card { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
	input, button { padding: 12px; border-radius: 8px; border: 1px solid #ccc; }
	button { background: #ff3e00; color: white; border: none; font-weight: bold; }
	.item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
</style>