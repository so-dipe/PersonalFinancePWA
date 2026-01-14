<script>
    export let title;
    export let open = false;

    function toggle() {
        open = !open;
    }
</script>

<div class="accordion">
    <button class="accordion-header" aria-expanded={open} on:click={toggle}>
        <span>{title}</span>
        <span class="chevron">{open ? '▾' : '▸'}</span>
    </button>
    {#if open}
        <div class="accordion-body">
            <slot />
        </div>
    {/if}
</div>

<style>
.accordion {
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
}


.accordion-header {
    all: unset;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    cursor: pointer;
    font-weight: 600;
}


.accordion-body {
    padding: var(--space-md);
    border-top: 1px solid var(--gray-200);
}


.chevron {
    font-size: 0.8rem;
    opacity: 0.7;
}
</style>
