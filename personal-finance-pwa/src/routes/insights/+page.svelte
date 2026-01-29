<script>
    import DateRangePicker from "$lib/components/DateRangePicker.svelte";
    import BarChart from "$lib/components/viz/BarChart.svelte";
    import CalendarHeatmap from "$lib/components/viz/CalendarHeatmap.svelte";
    import CategorySelector from "$lib/components/CategorySelector.svelte";
    import TransactionsInTheLastYear from "$lib/features/insights/TransactionsInTheLastYear.svelte";
    import { categories, useCategories } from "$lib/domains/categories";
    import TotalByCategory from "$lib/features/insights/TotalByCategory.svelte";
    import Totals from "$lib/features/insights/Totals.svelte";


    let start = new Date();
    let end = new Date();

    let selectedCategoriesUuids = [];

</script>

<div class="page">
    <DateRangePicker 
        start={start}
        end={end}
        on:change={(e) => {
            start = e.detail.start;
            end = e.detail.end;
        }}
    />
    <CategorySelector 
        categories={$categories}
        bind:selectedUuids={selectedCategoriesUuids}
    />
    <Totals 
        {start} 
        {end} 
        categoriesUuids={selectedCategoriesUuids}
    />
    <TotalByCategory {start} {end} />
    <TransactionsInTheLastYear />
</div>

<style>
    .page {
        padding: var(--space-lg);
        animation: fadeIn 0.3s ease;
        max-width: 1000px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
    }
</style>

