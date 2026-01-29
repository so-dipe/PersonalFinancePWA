<script>
    import CalendarHeatmap from "$lib/components/viz/CalendarHeatmap.svelte";
    import HeatmapTooltip from "$lib/components/viz/HeatmapTooltip.svelte";
    import InsightsAccordion from "./InsightsAccordion.svelte";
    import { dailyCategoryContribution } from "$lib/domains/insights";
    import { dailyTotals } from "$lib/domains/insights";
    import { getActiveCategories } from "$lib/domains/categories";

    let open = true;
    let hovered = null;

    let selectedCategoryUuids = [];
    let selectedTransactionType = "all";

    const today = new Date();
    
    const start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate() + 2);
    const end = new Date(today);

    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const dailyData = dailyCategoryContribution(startStr, endStr);

    $: heatmapData = 
        $dailyData 
            ? dailyTotals($dailyData).map(d => ({
                date: d.date,
                value: d.total
            }))
            : [];

</script>

<InsightsAccordion 
    title="Transactions in the last year"
    open={open}
    on:toggle={() => open = !open}
>
    <div class="container">
        <CalendarHeatmap
            data={heatmapData} 
            on:hover={e => hovered = e.detail}
            on:move={e => {
                if (hovered) {
                    hovered = {...hovered, ...e.detail}
                }
            }}
        />

        {#if open && hovered}
            <HeatmapTooltip {...hovered} />
        {/if}
    </div>
</InsightsAccordion>

<style>
.container {
    overflow-x: auto;
}
</style>