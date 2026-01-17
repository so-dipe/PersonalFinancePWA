<script>
    import { addTransaction, db, loadDefaultCategories } from "$lib/db";
    import { microTaskSyncEntity } from "$lib/sync/sync";
    import QuickActions from "./QuickActions.svelte";
    import ImportTransactionFromEmail from "./ImportTransactionFromEmail.svelte";
    import ImportTransactionFromCSV from "./ImportTransactionFromCSV.svelte";
    import { settings } from "$lib/settings/store";
    import { get } from "svelte/store"
    import { getDefaultTransactionForm } from "$lib/utils";
    import { onMount } from "svelte";
    import { notify } from "$lib/notification/store";
    import { errorToNotification } from "$lib/notification/toNotification";

    let form = getDefaultTransactionForm();
    let submitting = false;

    let prefilled = {
        transactionType: false,
        description: false,
        amount: false,
        category: false
    };

    function resetForm() {
        form = getDefaultTransactionForm();
    }

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

    onMount(async () => {
        let cats = await db.categories.where("deleted").equals(0).toArray();

        if (!cats.length) {
            await loadDefaultCategories();
            cats = await db.categories.toArray();
        }
        categories = cats;
    })

    $: filteredCategories = form.transactionType ? categories.filter((c) => c.transactionType === form.transactionType) : [];

    async function submit() {
        try {
            await addTransaction(form);
            resetForm();
            notify({ type: "success", message: "Transaction Saved" })
        } catch (err) {
            console.error(err);
            notify(errorToNotification(err))
            return;
        }
        const currentSettings = get(settings);
        if (currentSettings.sync.autoSync) {
            microTaskSyncEntity("transactions")
                .catch(err => {
                    console.warn("Autosync failed: ", err);
                })
        }
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

        <input type="text" placeholder="Description" bind:value={form.description} class:prefilled={prefilled.description}>

        <input type="number" placeholder="Amount" step="0.01" bind:value={form.amount} class:prefilled={prefilled.amount} min="0" required>

        <select bind:value={form.category} class:prefilled={prefilled.category} required>
            <option value="" disabled selected>Select category</option>
            {#each filteredCategories as category}
                <option>{category.name}</option>
            {/each}
        </select>
        
        <button class="button-primary" type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add transaction'}
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
        padding: var(--space-md);
        border-radius: var(--radius-sm);
    }
</style>