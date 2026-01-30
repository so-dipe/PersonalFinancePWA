<script>
    import CalendarHeatmap from "$lib/components/viz/CalendarHeatmap.svelte";
    import HeatmapTooltip from "$lib/components/viz/HeatmapTooltip.svelte";
    import InsightsAccordion from "./InsightsAccordion.svelte";
    import { dailyCategoryContribution, getAllYears } from "$lib/domains/insights";
    import { dailyTotals } from "$lib/domains/insights";
    import { getActiveCategories } from "$lib/domains/categories";

    let open = true;
    let hovered = null;

    let selectedCategoryUuids = [];
    let selectedTransactionType = "all";
    let selectedYear = null;

    const today = new Date();
    
    let start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate() + 2);
    let end = new Date(today);

    let startStr = start.toISOString().slice(0, 10);
    let endStr = end.toISOString().slice(0, 10);

    let dataStore = [];
    let heatmapData = []
    const years = getAllYears();

    function toggleYear(year) {
        selectedYear = year ?? null;

        if (!year) {
            start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate() + 2);
            end = new Date(today);
        } else {
            start = new Date(year, 0, 2);
            end = new Date(year, 11, 32);
        }
        startStr = start.toISOString().slice(0, 10);
        endStr = end.toISOString().slice(0, 10);
    }

    $: if (startStr && endStr) {
        dataStore = dailyCategoryContribution(startStr, endStr);
    }

    $: if (dataStore) {
        heatmapData = $dataStore 
            ? dailyTotals($dataStore).map(d => ({
                date: d.date,
                value: d.total
            }))
            : [];
    }

</script>

<InsightsAccordion 
    title="Transactions in the last year"
    open={open}
    on:toggle={() => open = !open}
>
    <div class="heatmap-layout">
        <div class="heatmap">
            <CalendarHeatmap
                data={heatmapData}
                end={end}
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
        <div class="year-selector">
            <button 
                class:selected={!selectedYear}
                on:click={() => toggleYear()}
            >
                Last 12 months
            </button>
            {#each $years as year}
                <button
                    class:selected={year === selectedYear}
                    on:click={() => toggleYear(year)}
                >
                    {year}
                </button>
            {/each}
        </div>
    </div>
</InsightsAccordion>

<style>
.heatmap-layout {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
}

.heatmap {
    overflow-x: auto;
    flex: 1;
    scroll-snap-type: x proximity;

}

.year-selector {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    max-height: 220px;
    overflow-y: auto;
    padding-left: var(--space-sm);
}

.year-selector button {
    all: unset;
    cursor: pointer;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    font-size: 0.75rem;
    color: var(--gray-700);
}

.year-selector button:hover {
    background: var(--gray-100);
}

.year-selector button.selected {
    background: var(--gray-200);
    font-weight: 600;
}

.year-selector button:first-child {
    margin-bottom: var(--space-sm);
    border-bottom: 1px solid var(--gray-200);
}

@media (max-width: 640px) {
.heatmap-layout {
    flex-direction: column;
}

.heatmap {
    width: 100%;
    overflow-x: auto;
}

.year-selector {
    flex-direction: row;
    flex-wrap: wrap;
    max-height: none;
}
}
</style>