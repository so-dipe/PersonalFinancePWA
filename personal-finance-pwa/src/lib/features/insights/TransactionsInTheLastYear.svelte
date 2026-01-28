<script>
    import CalendarHeatmap from "$lib/components/viz/CalendarHeatmap.svelte";
    import HeatmapTooltip from "$lib/components/viz/HeatmapTooltip.svelte";
    import * as d3 from "d3";

    let hovered = null;

    function generateDummyData() {
        const today = d3.timeDay.floor(new Date());
        const start = d3.timeDay.offset(today, -364);

        const days = d3.timeDays(start, d3.timeDay.offset(today, 1));

        return days.map(d => {
            const hasActivity = Math.random() > 0.25;

            let value = 0;

            if (hasActivity) {
                if (Math.random() > 0.6) {
                    value = Math.floor(Math.random() * 80_000) + 10_000;
                } else {
                    value = -1 * (Math.floor(Math.random() * 30_000) + 2_000);
                }
            }
            return {
                date: d3.timeFormat("%Y-%m-%d")(d),
                value
            };
        });
    }

    const dummyData = generateDummyData();
</script>

<div class="container">
    <h3>Transactions in the last year</h3>
    <CalendarHeatmap
    data={dummyData} 
    on:hover={e => hovered = e.detail}
    on:move={e => hovered = {...hovered, ...e.detail}}
    />
    {#if hovered}
        <HeatmapTooltip {...hovered} />
    {/if}
</div>

<style>
.container {
    overflow-x: auto;
}
</style>