<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let start = new Date();
    export let end = new Date();

    let selectedRange = "";

    const DEFAULT_RANGE_INDEX = 3;


    const ranges = [
        { label: "Last 7 days", fn: () => [daysAgo(7), new Date()] },
        { label: "This Week", fn: thisWeek },
        { label: "Last 30 days", fn: () => [daysAgo(30), new Date()] },
        { label: "This Month", fn: thisMonth },
        { label: "This Quarter", fn: thisQuarter },
        { label: "This Year", fn: thisYear}
    ]

    const [initialStart, initialEnd] = ranges[DEFAULT_RANGE_INDEX].fn();
    start = initialStart;
    end = initialEnd;
    selectedRange = DEFAULT_RANGE_INDEX;
    dispatch("change", { start, end })

    function selectRange(fn) {
        const [s, e] = fn();
        start = s;
        end = e;
        dispatch("change", { start, end });
    }


    function daysAgo(n, today=true) {
        const d = new Date();
        d.setDate(d.getDate() - n + 1);
        return d;
    }


    function thisWeek() {
        const now = new Date();
        const day = (now.getDay() + 6) % 7;
        const start = new Date(now);
        start.setDate(now.getDate() - day);
        return [start, now];
    }


    function thisMonth() {
        const now = new Date();
        return [new Date(now.getFullYear(), now.getMonth(), 2), now];
    }


    function thisQuarter() {
        const now = new Date();
        return [new Date(now.getFullYear(), now.getMonth() - (now.getMonth() % 3), 2), now];
    }


    function thisYear() {
        const now = new Date();
        return [new Date(now.getFullYear(), 0, 2), now];
    }

    $: startStr = start.toISOString().slice(0, 10);
    $: endStr = end.toISOString().slice(0, 10);
</script>


<div class="date-range">
    <select 
        bind:value={selectedRange} 
        on:change={() => selectedRange !== "" && selectRange(ranges[selectedRange].fn)}
    >
        <option value="">Custom</option>

        {#each ranges as r, i}
            <option value={i}>{r.label}</option>
        {/each}
    </select>

    <div class="dates">
        <input
            type="date"
            value={startStr}
            on:change={(e) => {
                start = new Date(e.target.value);
                dispatch("change", { start, end });
                selectedRange = "";
            }}
            max={endStr}
        />
        <span>➡️</span>
        <input
            type="date"
            value={endStr}
            on:change={(e) => {
                end = new Date(e.target.value);
                dispatch("change", { start, end });
                selectedRange = "";
            }}
            min={startStr}
        />
    </div>
</div>

<style>
.date-range {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
}

.date-range select,
.date-range input {
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    border: 1px solid var(--gray-400);
    background-color: var(--surface-1);
    font-size: 0.9rem;
}

.date-range select:focus,
.date-range input:focus {
    outline: none;
    border-color: var(--green-700);
}

.dates {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    color: var(--gray-700);
}

@media (max-width: 640px) {
.date-range {
    flex-direction: column;
    gap: var(--space-xs);
}
}
</style>





