<script>
    export let content;
    export let x;
    export let y;
</script>

<div class="tooltip" style="left:{x + 12}px; top:{y + 12}px">
    {content}
</div>

<style>
.tooltip {
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
</style>