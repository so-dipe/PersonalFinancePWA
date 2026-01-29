<script>
    import BarChart from "$lib/components/viz/BarChart.svelte";
    import BarChartTooltip from "$lib/components/viz/BarChartTooltip.svelte";
    import { summariseTransactionsByCategories } from "$lib/domains/insights";

    export let start;
    export let end;

    let hovered = null;

    $: startStr = start?.toISOString().slice(0, 10);
    $: endStr = end?.toISOString().slice(0, 10);

    let data;

    $: if (startStr && endStr) {
        data = summariseTransactionsByCategories(startStr, endStr);
    }

    $: barchartData = $data?.map(d => ({
        x: d.category.name,
        y: d.total
    }))
</script>

<BarChart 
    data={barchartData} 
    on:hover={e => hovered = e.detail}
    on:move={e => {
        if (hovered) {
            hovered = {...hovered, ...e.detail}
        }
    }}
/>

{#if hovered}
    <BarChartTooltip {...hovered} />
{/if}