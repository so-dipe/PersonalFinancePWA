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
    <CalloutCard 
        label="Total Income" 
        value={formatFinancial($totalIncome ?? "")} 
        icon="🤑"
        color="green"
    />
    <CalloutCard 
        label="Total Expenses" 
        value={formatFinancial($totalExpense ?? "")} 
        icon="😭"
        color="red"
    />
</div>

<style>
.main-stats {
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
}
</style>