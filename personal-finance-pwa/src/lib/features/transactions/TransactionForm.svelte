<script>
    import { getActiveCategories, loadDefaultCategories } from "$lib/domains/categories";
    import { getSetting } from "$lib/domains/settings";
    import { addTransaction } from "$lib/domains/transactions";
    import { errorToNotification } from "$lib/stores/notification.mapper";
    import { runMicroSync } from "$lib/sync/runSync";
    import { getDefaultTransactionForm } from "$lib/utils";
    import { onMount } from "svelte";
    import QuickActions from "$lib/components/QuickActions.svelte";
    import ImportTransactionFromEmail from "../import/ImportTransactionFromEmail.svelte";
    import ImportTransactionFromCSV from "../import/ImportTransactionFromCSV.svelte";
    import { notify } from "$lib/stores/notification.store";


    let categories = [];
    let filteredCategories = [];

    let form = getDefaultTransactionForm();
    let submitting = false;

    let prefilled = {
        transactionType: false,
        description: false,
        amount: false,
        categoryUuid: false
    };

    onMount(async () => {
        categories = await getActiveCategories();
        if (!categories.length) {
            await loadDefaultCategories();
            categories = await getActiveCategories();
        }
    });

    function resetForm() {
        form = getDefaultTransactionForm();
    }

    function prefillForm(data) {
        if (data.transactionType) {
            data.transactionType = data.transactionType.toLowerCase();
        }
        if (data.categoryUuid && !categories.find(c => c.uuid === data.categoryUuid)) {
            data.categoryUuid = ""
        }
        form = {...form, ...data};
        Object.keys(data).forEach((key) => {

            prefilled[key] = true;

            setTimeout(() => {
                prefilled[key] = false;
            }, 1200);
        });

    }

    $: filteredCategories = form.transactionType ? categories.filter((c) => c.transactionType === form.transactionType) : [];

    async function submit() {
        submitting = true;
        try {
            await addTransaction(form);
            resetForm();
            notify({ type: "success", message: "Transaction Saved" })
        } catch (e) {
            console.error(e);
            notify(errorToNotification(e));
            return;
        } finally {
            submitting = false;
        }
        runMicroSync("transactions");
    }
</script>

<div class="card">
    <h3>Add Transaction</h3>
    <form class="grid" on:submit|preventDefault={submit}>
        <input type="date" bind:value={form.date}>

        <select bind:value={form.transactionType} class:prefilled={prefilled.transactionType} required>
            <option value="" disabled selected>Select transaction type</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
        </select>

        <input type="text" placeholder="Description" bind:value={form.description} class:prefilled={prefilled.description}>

        <input type="number" placeholder="Amount" step="0.01" bind:value={form.amount} class:prefilled={prefilled.amount} min="0" required>

        <select bind:value={form.categoryUuid} class:prefilled={prefilled.categoryUuid} required>
            <option value="" disabled selected>Select category</option>
            {#each filteredCategories as category}
                <option value={category.uuid}>{category.name}</option>
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