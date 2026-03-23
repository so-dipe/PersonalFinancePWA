<script>
    import DateRangePicker from "$lib/components/DateRangePicker.svelte";
    import BarChart from "$lib/components/viz/BarChart.svelte";
    import CalendarHeatmap from "$lib/components/viz/CalendarHeatmap.svelte";
    import CategorySelector from "$lib/components/CategorySelector.svelte";
    import TransactionsInTheLastYear from "$lib/features/insights/TransactionsInTheLastYear.svelte";
    import { useCategories } from "$lib/domains/categories";
    import TotalByCategory from "$lib/features/insights/TotalByCategory.svelte";
    import Totals from "$lib/features/insights/Totals.svelte";
    import { liveInsights } from "$lib/domains/insights";


    let start = new Date();
    let end = new Date();

    $: startStr = start.toISOString().slice(0, 10);
    $: endStr = end.toISOString().slice(0, 10);

    let selectedCategoriesUuids = [];

    const categories = useCategories();

    $: insightsData = liveInsights(startStr, endStr, selectedCategoriesUuids);

</script>

<div class="page">
    <header class="header">
        <div class="controls">
            <div>
                <DateRangePicker 
                    start={start}
                    end={end}
                    on:change={(e) => {
                        start = e.detail.start;
                        end = e.detail.end;
                    }}
                />
            </div>
            <div>
                <CategorySelector 
                    categories={$categories}
                    bind:selectedUuids={selectedCategoriesUuids}
                />
            </div>
        </div>
    </header>
    
    <div class="section">
        <Totals 
            totalIncome={$insightsData?.totalIncome}
            totalExpense={$insightsData?.totalExpense}
        />
    </div>
    <div class="section">
        <TotalByCategory
            data={$insightsData?.categorySummary}
        />
    </div>
    <div class="section">
        <TransactionsInTheLastYear />
    </div>
</div>

<style>
    .page {
        padding: clamp(8px, 2vw, 20px);
        max-width: 1150px;
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
        background: var(--surface-2);
        border-radius: var(--radius-lg);
        padding: var(--space-md);
        border: 1px solid var(--gray-200);
    }

    .header h3 {
        font-weight: 600;
        letter-spacing: -0.02rem;
    }

 .controls {
    display: flex;
    align-items: center;
    gap: var(--space-md);      /* increase spacing slightly */
    padding: calc(var(--space-xs) + 2px) var(--space-sm);
    background: #fff;
    border-radius: var(--radius-md);
    border: 1px solid var(--gray-200);
    width: 100%;
 /* overflow-x: auto;
    overflow-y: hidden; */
    justify-content: flex-start;  /* stop forcing edge spacing */
    flex-wrap: wrap;
}


    .section {
        background: var(--surface-1);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--gray-200);
    }

@media (max-width: 640px) {
.controls {
    flex-direction: row;
    gap: var(--space-xs);
    padding: var(--space-xs);
}

.controls > * {
    width: 100%;
}
}
</style>

