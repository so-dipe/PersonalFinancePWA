<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let start = new Date();
    export let end = new Date();

    const ranges = [
        { label: "Last 7 days", fn: () => [daysAgo(7), new Date()] },
        { label: "This Week", fn: thisWeek },
        { label: "Last 30 days", fn: () => [daysAgo(30), new Date()] },
        { label: "This Month", fn: thisMonth },
        { label: "This Quarter", fn: thisQuarter },
        { label: "This Year", fn: thisYear}
    ]

    function daysAgo(n, today=true) {
        const d = new Date();
        if (today) {
            d.setDate(d.getDate() - n + 1);
            return d;
        };
        d.setDate(d.getDate() -n);
        return d;
    }

    function thisWeek() {
        const now = new Date();
        const day = now.getDay();
        const start = new Date(now);
        start.setDate(now.getDate() - day + 1);
        return [start, now];
    }

    function thisMonth() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return [start, now];
    }

    function thisQuarter() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - (now.getMonth() % 3), 1);
        return [start, now];
    }

    function thisYear() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        return [start, now];
    }

    function selectRange(rangeFn) {
        const [s, e] = rangeFn();
        start = s;
        end = e;
        dispatchChange();
    }

    function onChange() {
        dispatchChange();
    }

    function dispatchChange() {
        dispatch("change", { start, end });
    }

    $: startStr = start.toISOString().slice(0, 10);
    $: endStr = end.toISOString().slice(0, 10);
</script>

<div>
    <select on:change="{e => selectRange(ranges[e.target.selectedIndex].fn)}">
        {#each ranges as r}
            <option>{r.label}</option>
        {/each}
    </select>

    <input type="date" bind:value={startStr} on:change={onChange} />
    <span>to</span>
    <input type="date" bind:value={endStr} on:change={onChange} />
</div>
