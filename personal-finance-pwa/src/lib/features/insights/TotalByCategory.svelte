<script>
    import BarChart from "$lib/components/viz/BarChart.svelte";
    import BarChartTooltip from "$lib/components/viz/BarChartTooltip.svelte";
    import { summariseTransactionsByCategories } from "$lib/domains/insights";

    export let start;
    export let end;

    export let categoriesUuids = [];

    let hovered = null;

    const TYPE_COLORS = {
        income: "var(--green-700)",
        expense: "var(--red-700)"
    }

    $: startStr = start?.toISOString().slice(0, 10);
    $: endStr = end?.toISOString().slice(0, 10);

    let dataStore;
    let barChartData = [];

    $: if (startStr && endStr) {
        dataStore = summariseTransactionsByCategories(startStr, endStr);
    }

    $: if (dataStore && categoriesUuids) {
        const rawData = $dataStore ?? [];
        let filtered = categoriesUuids.length > 0
            ? rawData.filter(d => categoriesUuids.includes(d.category.uuid))
            : rawData;

        const typeOrder = { income: 0, expense: 1}
        filtered.sort((a, b) => {
            const typeDiff = typeOrder[a.category.transactionType] - typeOrder[b.category.transactionType];
            if (typeDiff !== 0) return typeDiff;
            return b.total - a.total;
        })

        barChartData = filtered.map(d => ({
            x: d.category.name,
            y: d.total,
            color: TYPE_COLORS[d.category.transactionType]
        }));
    }
</script>

<div class="container">
    <h3>By Category</h3>
    <div class="chart">
        <BarChart 
            data={barChartData} 
            on:hover={e => hovered = e.detail}
            on:move={e => {
                if (hovered) {
                    hovered = {...hovered, ...e.detail}
                }
            }}
        />
    </div>
</div>

{#if hovered}
    <BarChartTooltip {...hovered} />
{/if}

<style>
.chart {
    overflow-x: auto;
}
</style>
