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

<section class="card transaction-card">
    <header class="card-header">
        <div class="title-group">
            <span class="title-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 5v14M5 12h14" />
                </svg>
            </span>
            <div>
                <h3>Add Transaction</h3>
                <p class="text-muted">Capture income or expenses instantly</p>
            </div>
        </div>
    </header>

    <div class="card-section top-panels">
        <QuickActions on:prefill={(e) => prefillForm(e.detail)}/>

        <section class="barchips import-card">
           
            <div class="import-body">
                <div class="import-chips">
                     
                    <div class="chip">
                       
                        <div class="chip-label"> <ImportTransactionFromEmail /></div>
                    </div>
                    <div class="chip">
                     
                        <div class="chip-label"><ImportTransactionFromCSV /></div>
                    </div>
                </div>
               
                
            </div>
        </section>
    </div>

    <div class="card-body">
        <form class="grid transaction-form" on:submit|preventDefault={submit}>
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
        
        <button class="button-primary submit-btn" type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add transaction'}
        </button>
        </form>
    </div>

</section>

<style>
    .barchips {
    padding: clamp(6px, 1vw, 5px);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    position: relative;
      background: var(--surface-2);
    border-style: dashed;
    box-shadow: none;
    margin-bottom: 20px;
}
    .prefilled {
        background-color: var(--green-100);
        transition:
            background-color 0.6s ease,
            border-color 0.6s ease;
    }

    .transaction-card .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-md);
    }

    .title-group {
        display: flex;
        align-items: center;
        gap: var(--space-md);
    }

    .title-group h3 {
        margin: 0;
    }

    .title-group p {
        margin: 0.2rem 0 0;
        font-size: 0.85rem;
    }

    .title-icon {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: var(--green-100);
        display: grid;
        place-items: center;
        color: var(--green-700);
        border: 1px solid var(--green-500);
    }

    .title-icon svg {
        width: 20px;
        height: 20px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .transaction-form {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .transaction-form input,
    .transaction-form select {
        width: 100%;
    }

    .submit-btn {
        grid-column: 1 / -1;
        justify-self: end;
        min-width: 180px;
    }

    .card-body {
        padding-bottom: var(--space-md);
        border-bottom: 1px solid var(--gray-200);
    }

    .card-section {
        padding-top: var(--space-md);
    }

    .top-panels {
        display: flex;
        gap: var(--space-md);
        align-items: stretch;
        flex-wrap: nowrap;
    }

    .top-panels > * {
        flex: 1 1 0;
        min-width: 0;
    }

    .import-card {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        height: 100%;
    }

  

    .import-body {
        display: grid;
        gap: var(--space-sm);
    }

    .import-chips {
        /* display: flex; */
        /* flex-wrap: wrap; */
        gap: 0.5rem;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.35rem 0.65rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--green-900);

    }

   

    
    @media (max-width: 720px) {
        .top-panels {
            flex-direction: column;
        }

        .transaction-form {
            grid-template-columns: 1fr;
        }

        .submit-btn {
            width: 100%;
            justify-self: stretch;
        }
    }

</style>
