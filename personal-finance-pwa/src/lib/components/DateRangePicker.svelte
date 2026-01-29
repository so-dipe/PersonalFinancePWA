<script>
    import { createEventDispatcher } from "svelte";


    const dispatch = createEventDispatcher();


    export let start = new Date();
    export let end = new Date();


    let selectedRange = "";


    const ranges = [
        { label: "Last 7 days", fn: () => [daysAgo(7), new Date()] },
        { label: "This Week", fn: thisWeek },
        { label: "Last 30 days", fn: () => [daysAgo(30), new Date()] },
        { label: "This Month", fn: thisMonth },
        { label: "This Quarter", fn: thisQuarter },
        { label: "This Year", fn: thisYear}
    ]

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


<div>
    <select 
        bind:value={selectedRange} 
        on:change={() => selectedRange !== "" && selectRange(ranges[selectedRange].fn)}
    >
        <option value="" disabled>Custom</option>

        {#each ranges as r, i}
            <option value={i}>{r.label}</option>
        {/each}
    </select>


    <input
        type="date"
        value={startStr}
        on:change={(e) => {
            start = new Date(e.target.value);
            dispatch("change", { start, end });
            selectedRange = "";
        }}
    />
    <span>to</span>
    <input
        type="date"
        value={endStr}
        on:change={(e) => {
            end = new Date(e.target.value);
            dispatch("change", { start, end });
            selectedRange = "";
        }}
    />
</div>





