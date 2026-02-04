<script>
    import CalloutCard from "$lib/components/viz/CalloutCard.svelte";
    import { categories } from "$lib/domains/categories";
    import { totals } from "$lib/domains/insights";
    import { formatFinancial } from "$lib/utils";

    export let start;
    export let end;
    export let categoriesUuids;

    $: selectedCategories = $categories?.filter(c => categoriesUuids.includes(c.uuid)) ?? [];

    $: incomeCategoriesUuids = selectedCategories.filter(c => c.transactionType === "income").map(c => c.uuid);
    $: expenseCategoriesUuids = selectedCategories.filter(c => c.transactionType === "expense").map(c => c.uuid);

    $: startStr = start?.toISOString().slice(0, 10);
    $: endStr = end?.toISOString().slice(0, 10);

    $: totalIncome = totals(startStr, endStr, incomeCategoriesUuids);
    $: totalExpense = totals(startStr, endStr, expenseCategoriesUuids);
</script>

<div class="main-stats">
    <div class="stat-card">
        <CalloutCard 
            label="Total Income" 
            value={formatFinancial($totalIncome ?? "")} 
            icon=""
            color="green"
        />
    </div>
    <div class="stat-card">
        <CalloutCard 
            label="Total Expenses" 
            value={formatFinancial($totalExpense ?? "")} 
            icon=""
            color="red"
        />
    </div>
</div>

<style>
.main-stats {
    display: flex;
    gap: var(--space-md);
    flex-wrap: nowrap;
}

.stat-card {
    flex: 1 1 0;
    min-width: 0;
}

@media (max-width: 600px) {
    .main-stats {
        gap: var(--space-sm);
    }

    :global(.main-stats .label) {
        font-size: 0.7rem;
    }

    :global(.main-stats .value) {
        font-size: 1.25rem;
    }
}

</style>
