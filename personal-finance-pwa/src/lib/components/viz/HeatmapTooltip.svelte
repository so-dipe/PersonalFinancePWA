<script>
    import { formatFinancial } from "$lib/utils";

    export let date;
    export let value;
    export let x;
    export let y;
</script>

<div class="heatmap-tooltip" style="left:{x + 12}px; top:{y + 12}px">
    <div class="heatmap-tooltip-date">
        {new Date(date).toDateString()}
    </div>
    <div class="heatmap-tooltip-value" data-positive={value >= 0}>
        {formatFinancial(value)}
    </div>
</div>

<style>
.heatmap-tooltip {
    position: fixed;
    z-index: 1000;
    pointer-events: none;

    background: var(--bg-card);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-md);

    padding: var(--space-sm) var(--space-md);
    font-size: 0.75rem;
    line-height: 1.3;
}

.heatmap-tooltip-date {
    color: var(--text-muted);
    margin-bottom: var(--space-xs);
    white-space: nowrap;
}

.heatmap-tooltip-value {
    font-weight: 600;
    white-space: nowrap;
}

.heatmap-tooltip-value[data-positive="true"] {
    color: var(--green-700);
}

.heatmap-tooltip-value[data-positive="false"] {
    color: var(--red-700);
}
</style>