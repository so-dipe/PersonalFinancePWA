<script>
    export let title;
    export let open = false;

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    function toggle() {
        dispatch('toggle');
    }
</script>

<div class="accordion">
    <button class="accordion-header" aria-expanded={open} on:click={toggle}>
        <h3>{title}</h3>
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
    width: 100%;
    border: 1px solid var(--gray-200);
    padding: var(--space-md);
    border-radius: var(--radius-md);
}


.accordion-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: none;
    border: none;
    padding: 0;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
}


.chevron {
    transition: transform 0.2s ease;
}

.accordion-body {
    margin-top: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}
</style>
