<script>
    import { TRANSACTION_TYPE_LABELS } from "$lib/constants/constants";
    import { createEventDispatcher } from "svelte";

    export let categories = [];
    export let selectedUuids = [];

    let visible = false;

    const dispatch = createEventDispatcher();

    $: if (categories.length && selectedUuids.length === 0) {
        selectedUuids = categories.map(c => c.uuid);
    }

    $: grouped = {
        income: categories.filter(c => c.transactionType === 'income'),
        expense: categories.filter(c => c.transactionType === 'expense')
    };

    $: allSelected = selectedUuids.length === categories.length;

    function toggleSelectAll() {
        if (allSelected) {
            selectedUuids = [];
        } else {
            selectedUuids = categories.map(c => c.uuid);
        }
        dispatch("change", selectedUuids);
    }

    function toggleCategory(uuid) {
        if (selectedUuids.includes(uuid)) {
            selectedUuids = selectedUuids.filter(x => x !== uuid);
        } else {
            selectedUuids = [...selectedUuids, uuid];
        }
        dispatch("change", selectedUuids);
    }

    function toggleGroup(type) {
        const uuidsInGroup = grouped[type].map(c => c.uuid);
        const allInGroupSelected = uuidsInGroup.every(uuid => selectedUuids.includes(uuid));

        if (allInGroupSelected) {
            selectedUuids = selectedUuids.filter(u => !uuidsInGroup.includes(u));
        } else {
            selectedUuids = [...selectedUuids, ...uuidsInGroup];
        }
        dispatch("change", selectedUuids)
    }
</script>

<button on:click={() => visible = !visible} class="toggle-button">
    {visible ? "Hide Categories" : "Show Categories"}
</button>

{#if visible}
<div class="category-selector">
    <label class="select-all">
        <input 
            type="checkbox" 
            bind:checked={(allSelected)} 
            on:change={toggleSelectAll} 
        />
        Select all
    </label>
    {#each Object.entries(grouped) as [type, cats]}
    <div class="category-group">
        <label class="group-label">
            <input 
                type="checkbox" 
                checked={cats.every(c => selectedUuids.includes(c.uuid))} 
                on:change={() => toggleGroup(type)} 
            />
            {TRANSACTION_TYPE_LABELS[type]}
        </label>
        {#each cats as cat}
        <label class="category-item">
            <input 
                type="checkbox" 
                checked={selectedUuids.includes(cat.uuid)} 
                on:change={() => toggleCategory(cat.uuid)} 
            />
            {cat.name}
        </label>
        {/each}
    </div>
    {/each}
</div>
{/if}

<style>
.category-selector {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    max-width: 300px;
}

.select-all {
    font-weight: bold;
    margin-bottom: var(--space-xs);
}

.category-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    margin-left: var(--space-xs);
    margin-bottom: var(--space-xs);
}

.group-label {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: var(--space-xs);
}

.category-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    margin-left: var(--space-xs);
}

.toggle-button {
    margin-bottom: var(--space-md);
    padding: var(--space-xs) var(--space-md);
}
</style>