<script>
    import BarChart from "$lib/components/viz/BarChart.svelte";
    import BarChartTooltip from "$lib/components/viz/BarChartTooltip.svelte";

    export let data;

    let hovered = null;

    const TYPE_COLORS = {
        income: "var(--green-700)",
        expense: "var(--red-700)"
    }

    let barChartData = [];

    $: if (data) {
        const rawData = data ?? [];

        const typeOrder = { income: 0, expense: 1}
        rawData.sort((a, b) => {
            const typeDiff = typeOrder[a.category.transactionType] - typeOrder[b.category.transactionType];
            if (typeDiff !== 0) return typeDiff;
            return b.total - a.total;
        })

        barChartData = rawData.map(d => ({
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
