<script>
    import { getCurrentBudgetWindow } from "$lib/domains/budgets";
    import { getTransactionsByCategory } from "$lib/domains/transactions";
    import { createEventDispatcher, onDestroy } from "svelte";
    import BudgetProgress from "./BudgetProgress.svelte";
    import BudgetForm from "./BudgetForm.svelte";
    import BudgetSummary from "./BudgetSummary.svelte";

    const dispatch = createEventDispatcher();

    /* ---------------- props ---------------- */
    export let budget;
    export let mode = "view";
    export let categories = [];

    /* ---------------- local state ---------------- */
    let draft = {};
    let transactions = [];
    let unsubscribe; // for liveQuery cleanup

    let txSubscription;

    /* ---------------- derived state ---------------- */

    // source of truth depends on mode
    $: source = mode === "view" ? budget : draft;

    // budget window
    $: ({ start, end } = source?.startDate
        ? getCurrentBudgetWindow(
            source.startDate,
            source.periodUnit,
            source.periodCount
        )
        : { start: "", end: "" });

    // category info
    $: category = categories.find(c => c.uuid === source?.categoryUuid);
    $: categoryName = category?.name ?? "";
    $: categoryTransactionType = category?.transactionType ?? "";

    // progress calculation
    $: progressPercent = budget?.amount
        ? Math.round(
                transactions.reduce((sum, t) => sum + t.amount, 0) /
                budget.amount *
                100
            )
        : 0;

    /* ---------------- side effects ---------------- */

    // clone budget into draft
    $: if (budget && mode === "edit") {
        draft = structuredClone(budget);
    }

    // liveQuery subscription (reacts to category + date window)
    $: subscriptionKey = budget?.categoryUuid && start && end
    ? `${budget.categoryUuid}-${start}-${end}`
    : null;

    $: if (subscriptionKey) {
        txSubscription?.unsubscribe();

        txSubscription = getTransactionsByCategory(
            budget.categoryUuid,
            start,
            end
        ).subscribe(txs => {
            transactions = txs;
        });
    }

    onDestroy(() => {
        txSubscription?.unsubscribe();
    });

    /* ---------------- events ---------------- */
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


<div class="budget-card {mode} {categoryTransactionType}" on:click={mode === 'view' ? edit : null}>
    <div class="strip {categoryTransactionType}"></div>

    <div class="content">
        {#if mode === "view"}
            <BudgetSummary
                {budget}
                categoryName={categoryName}
                transactionType={categoryTransactionType}
                start={start}
                end={end}
                on:edit={() => dispatch('edit', budget)}
                on:delete={() => dispatch('delete', budget)}
            />
            <BudgetProgress percent={progressPercent} type={categoryTransactionType} />            
        {:else}
            <!-- Edit mode form -->
            <BudgetForm
                {draft}
                {categories}
                {start}
                {end}
                on:save={(e) => dispatch("save", e.detail)}
                on:cancel={cancel}
            />
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
    cursor: default;
    transition: box-shadow 0.2s;
}

.budget-card.view:hover {
    box-shadow: var(--shadow-md);
    cursor: pointer;
}

.content {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.budget-card.income {
    border-left: 2px solid var(--green-500);
}

.budget-card.expense {
    border-left: 2px solid var(--red-500);
}

</style>
