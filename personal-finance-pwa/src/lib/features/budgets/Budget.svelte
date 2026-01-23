<script>
    import { BUDGET_PERIODS } from "$lib/constants/constants";
    import { getCurrentBudgetWindow } from "$lib/domains/budgets";
    import { createEventDispatcher } from "svelte";
    import { get } from "svelte/store";

    const dispatch = createEventDispatcher();

    export let budget;
    export let mode = "view";
    export let categories = [];

    let draft = {};

    $: if (budget) {
        draft = structuredClone(budget);
    }
    $: source = mode === 'view' ? budget : draft;

    $: ({start, end} = source?.startDate ? getCurrentBudgetWindow(
        source.startDate, 
        source.periodUnit, 
        source.periodCount
    ) : { start: "", end: "" });
    
    $: category = categories.find(c => c.uuid === source?.categoryUuid);
    $: categoryName = categories?.name ?? "";
    $: categoryTransactionType = categories?.transactionType ?? "";

    function save() {
        dispatch("save", draft);
    }

    function cancel() {
        dispatch("cancel");
    }

    function edit() {
        dispatch("edit", budget);
    }

    function del() {
        dispatch("delete", budget);
    }
    
</script>

<div class="budget-card {mode}">
    <div class="strip {categoryTransactionType}"></div>
    <div class="content">
        {#if mode === "view"}
        <div class="summary">
            <strong>{categoryName}</strong>
            <span class="text-muted">{budget.description}</span>
            <span class="amount">{budget.amount}</span>
        </div>
        <div class="period text-muted">
            {start} ➡️ {end}
        </div>
        {:else}
        <div class="form-grid">
            <label>
                Category
                <select bind:value={draft.categoryUuid}>
                    {#each categories as cat}
                        <option value={cat.uuid}>{cat.name}</option>
                    {/each}
                </select>
            </label>
            <label>
                Description
                <input type="text" bind:value={draft.description} />
            </label>
            <label>
                Amount
                <input type="number" bind:value={draft.amount} min="0.01" step="0.01"/>
            </label>
            <label>
                Start Date
                <input type="date" bind:value={draft.startDate} />
            </label>
            <label>
                Period
                <select bind:value={draft.periodUnit}>
                    {#each Object.entries(BUDGET_PERIODS) as [period, periodName]}
                        <option value={period}>{periodName}</option>
                    {/each}
                </select>
            </label>
            <label>
                Period Count
                <input type="number" bind:value={draft.periodCount} min="1" max="10" step="1" />
            </label>
            <div class="period-preview text-muted">
                {start} ➡️ {end}
            </div>
        </div>
        {/if}
    </div>
    <div class="actions">
        {#if mode === "view"}
            <button on:click={edit}>Edit</button>
            <button class="danger" on:click={del}>Delete</button>
        {:else}
            <button class="primary" on:click={save}>Save</button>
            <button on:click={cancel}>Cancel</button>
        {/if}
    </div>
</div>

<style>
.budget-card {
    background: var(--bg-card);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    display: grid;
    grid-template-columns: 6px 1fr auto;
    gap: var(--space-md);
    padding: var(--space-md);
}

.strip.income {
    background: var(--green-500);
}

.strip.expense {
    background: var(--red-500);
}

.content {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.summary {
    display: flex;
    gap: var(--space-md);
    align-items: center;
}

.amount {
    margin-left: auto;
    font-weight: 600;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
}

.form-grid label {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
    gap: var(--space-xs);
}

.period-preview {
    grid-column: span 2;
}

.actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.actions button.primary {
    background: var(--green-700);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.75rem;
}

.actions button.danger {
    color: var(--red-700);
}
</style>