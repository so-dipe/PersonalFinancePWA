<script>
    import { addTransaction, db, loadDefaultCategories } from "$lib/db";
    import { microTaskSyncEntity } from "$lib/sync";
    import QuickActions from "$lib/components/QuickActions.svelte";
    import ImportTransactionFromEmail from "$lib/components/ImportTransactionFromEmail.svelte";
    import ImportTransactionFromCSV from "./ImportTransactionFromCSV.svelte";

    let form = {
        date: new Date().toISOString().slice(0, 10),
        transactionType: "",
        description: "",
        amount: "",
        category: ""
    };

    let prefilled = {
        transactionType: false,
        description: false,
        amount: false,
        category: false
    };

    function prefillForm(data) {
        form = {...form, ...data};
        Object.keys(data).forEach((key) => {

            prefilled[key] = true;

            setTimeout(() => {
                prefilled[key] = false;
            }, 1200);
        });

    }

    let categories = [];

    db.categories.toArray().then((cats) => {
        if (cats.length === 0) {
            loadDefaultCategories().then(() => {
                db.categories.toArray().then((newCats) => {
                    categories = newCats.map(c => c.name);
                });
            });
        } else {
            categories = cats.map(c => c.name);
        }
    });

    async function submit() {
        const { date, transactionType, description, amount, category } = form;
        await addTransaction(date, transactionType, description, amount, category);
        await microTaskSyncEntity('transactions');

        form = {
            date: new Date().toISOString().slice(0, 10),
            transactionType: "",
            description: "",
            amount: "",
            category: ""
        };
    }
</script>

<div class="card">
    <h3>Add Transaction</h3>
    <form class="grid" on:submit|preventDefault={submit}>
        <input type="date" bind:value={form.date}>

        <select bind:value={form.transactionType} class:prefilled={prefilled.transactionType} required>
            <option value="" disabled selected>Select transaction type</option>
            <option>Income</option>
            <option>Expense</option>
        </select>

        <input type="text" placeholder="Description" bind:value={form.description} class:prefilled={prefilled.transactionType}>

        <input type="number" placeholder="Amount" bind:value={form.amount} class:prefilled={prefilled.amount} required>

        <select bind:value={form.category} class:prefilled={prefilled.category} required>
            <option value="" disabled selected>Select category</option>
            {#each categories as category}
                <option>{category}</option>
            {/each}
        </select>
        
        <button class="button-primary" type="submit">
            Add transaction
        </button>
    </form>

    <div class="mt-md">
        <QuickActions on:prefill={(e) => prefillForm(e.detail)}/>
    </div>

    <div class="mt-md">
        <p class="text-muted mt-md">Import</p>
        <ImportTransactionFromEmail />
        <ImportTransactionFromCSV />
    </div>

</div>

<style>
    .prefilled {
        background-color: var(--green-100);
        transition:
            background-color 0.6s ease,
            border-color 0.6s ease;
    }
</style>