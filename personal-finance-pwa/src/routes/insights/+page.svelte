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
    <header class="header">
        <h3>Insights</h3>
        <div class="controls">
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
        </div>
    </header>
    
    <div class="section">
        <Totals 
            {start} 
            {end} 
            categoriesUuids={selectedCategoriesUuids}
        />
    </div>
    <div class="section">
        <TotalByCategory 
            {start} 
            {end}
            categoriesUuids={selectedCategoriesUuids}
        />
    </div>
    <div class="section">
        <TransactionsInTheLastYear />
    </div>
</div>

<style>
    .page {
        padding: var(--space-xl) var(--space-md);
        max-width: 1100px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-md);
        flex-wrap: wrap;
    }

    .header h3 {
        font-weight: 600;
        letter-spacing: -0.02rem;
    }

    .controls {
        display: flex;
        gap: var(--space-sm);
        padding: var(--space-xs);
        background: var(--surface-2);
        border-radius: var(--radius-sm);
    }

    .section {
        background: var(--surface-1);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
        box-shadow: var(--shadow-md);
    }
</style>

