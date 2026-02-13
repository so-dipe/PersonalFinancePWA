<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let start = new Date();
    export let end = new Date();

    let selectedRange = "";
    let showCustomDate = false;
    let dialog;
    let hasUserChanged = false;

    const DEFAULT_RANGE_INDEX = 3;

    const ranges = [
        { label: "Last 7 days", fn: () => [daysAgo(7), new Date()] },
        { label: "This Week", fn: thisWeek },
        { label: "Last 30 days", fn: () => [daysAgo(30), new Date()] },
        { label: "This Month", fn: thisMonth },
        { label: "This Quarter", fn: thisQuarter },
        { label: "This Year", fn: thisYear }
    ];

    const [initialStart, initialEnd] = ranges[DEFAULT_RANGE_INDEX].fn();
    start = initialStart;
    end = initialEnd;
    selectedRange = DEFAULT_RANGE_INDEX;
    dispatch("change", { start, end });

    function selectRange(fn) {
        const [s, e] = fn();
        start = s;
        end = e;
        hasUserChanged = true;
        dispatch("change", { start, end });
    }

    function daysAgo(n) {
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
    const rangeFormatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric"
    });

    $: buttonLabel = hasUserChanged
        ? (selectedRange !== "" && ranges[selectedRange]
            ? ranges[selectedRange].label
            : `${rangeFormatter.format(start)} - ${rangeFormatter.format(end)}`)
        : "Custom Date";

    function openCustomDate() {
        showCustomDate = true;
        if (dialog && !dialog.open) dialog.showModal();
    }

    function closeCustomDate() {
        showCustomDate = false;
        if (dialog) dialog.close();
    }
</script>

<div class="date-range">
    <select
        bind:value={selectedRange}
        on:change={() => {
            if (selectedRange !== "") {
                selectRange(ranges[selectedRange].fn);
            }
        }}
    >
        <option value="">Custom</option>

        {#each ranges as r, i}
            <option value={i}>{r.label}</option>
        {/each}
    </select>

    <button class="custom-date-btn" type="button" on:click={openCustomDate}>
        {buttonLabel}
    </button>
</div>

<dialog
    class="custom-date-modal"
    bind:this={dialog}
    on:close={() => (showCustomDate = false)}
    on:keydown={(e) => {
        if (e.key === "Escape") closeCustomDate();
    }}
>
    <div class="modal-head">
        <h3>Custom Dates</h3>
        <button class="icon-btn" type="button" on:click={closeCustomDate} aria-label="Close">
            X
        </button>
    </div>
    <div class="modal-body">
        <div class="dates">
            <input
                type="date"
                value={startStr}
                on:change={(e) => {
                    start = new Date(e.target.value);
                    dispatch("change", { start, end });
                    selectedRange = "";
                    hasUserChanged = true;
                }}
                max={endStr}
            />

            <span class="arrow">To</span>

            <input
                type="date"
                value={endStr}
                on:change={(e) => {
                    end = new Date(e.target.value);
                    dispatch("change", { start, end });
                    selectedRange = "";
                    hasUserChanged = true;
                }}
                min={startStr}
            />
        </div>
    </div>
    <div class="modal-actions">
        <button class="ghost" type="button" on:click={closeCustomDate}>Done</button>
    </div>
</dialog>

<style>
    .custom-date-btn {
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        border: 1px solid var(--gray-400);
        background-color: var(--surface-1);
        cursor: pointer;
        font-size: 0.9rem;
        width: 140px;
    }

    .dates {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        border-radius: var(--radius-sm);
        border: 1px solid var(--gray-400);
        background-color: var(--surface-1);
    }

    .arrow {
        font-size: 14px;
    }

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

    dialog.custom-date-modal {
        border: none;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        background: var(--bg-card);
        color: var(--text-main);
        width: min(520px, 92vw);
        max-height: 90vh;
        padding: 0;
    }

    dialog.custom-date-modal::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }

    .modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-md);
        border-bottom: 1px solid var(--gray-200);
    }

    .modal-body {
        padding: var(--space-md);
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: var(--space-md);
        border-top: 1px solid var(--gray-200);
        background: var(--bg-card);
    }

    .icon-btn {
        border: 1px solid var(--gray-200);
        background: var(--surface-2);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        padding: 0;
        display: grid;
        place-items: center;
        font-size: 0.9rem;
    }

    .ghost {
        background: transparent;
        border: 1px solid var(--gray-200);
        color: var(--text-main);
    }

    @media (max-width: 640px) {
        .date-range {
            flex-direction: row;
            gap: var(--space-xs);
        }

        .dates {
            width: 100%;
            justify-content: space-between;
            border: none;
            background: transparent;
        }

        .dates input {
            width: 100%;
        }
    }
</style>
