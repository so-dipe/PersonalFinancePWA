<script>
    import { addTransaction, db, loadDefaultCategories } from "$lib/db";
    import { microTaskSyncEntity } from "$lib/sync";
    import QuickActions from "./QuickActions.svelte";
    import ImportTransactionFromEmail from "./ImportTransactionFromEmail.svelte";
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
    let filteredCategories = [];

    db.categories.where('deleted').equals(0).toArray().then((cats) => {
        if (cats.length === 0) {
            loadDefaultCategories().then(async () => {
                categories = await db.categories.toArray();
            });
        } else {
            categories = cats;
        }
    });

    async function submit() {
        const { date, transactionType, description, amount, category } = form;
        await addTransaction(form);
        await microTaskSyncEntity('transactions');

        form = {
            date: new Date().toISOString().slice(0, 10),
            transactionType: "",
            description: "",
            amount: "",
            category: ""
        };
    }

    $: filteredCategories = form.transactionType ? categories.filter(c => c.transactionType === form.transactionType) : [];
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
            {#each filteredCategories as category}
                <option>{category.name}</option>
            {/each}
        </select>
        
        <button class="button-primary" type="submit">
            Add transaction
        </button>
    </form>

    <div class="mt-md">
        <QuickActions on:prefill={(e) => prefillForm(e.detail)}/>
    </div>

    <div class="card import-container">
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

    .import-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }
</style>